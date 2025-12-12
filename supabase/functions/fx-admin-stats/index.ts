import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check feature flag
    const enableFxSmartSave = Deno.env.get("ENABLE_FX_SMARTSAVE") !== "false";
    if (!enableFxSmartSave) {
      return new Response(
        JSON.stringify({ error: "FX-SmartSave is disabled" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (!isAdmin) {
      // Also check user_roles table directly with service role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(
          JSON.stringify({ error: "Forbidden - Admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Parse query params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const exportCsv = url.searchParams.get("export") === "csv";

    // Build query for logs
    let logsQuery = supabase
      .from("fx_smart_save_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (startDate) {
      logsQuery = logsQuery.gte("created_at", startDate);
    }
    if (endDate) {
      logsQuery = logsQuery.lte("created_at", endDate);
    }

    // Get paginated logs
    const offset = (page - 1) * limit;
    const { data: logs, count, error: logsError } = await logsQuery
      .range(offset, offset + limit - 1);

    if (logsError) {
      throw logsError;
    }

    // Calculate aggregates
    let aggregateQuery = supabase
      .from("fx_smart_save_logs")
      .select("savings_usd, product_type");

    if (startDate) {
      aggregateQuery = aggregateQuery.gte("created_at", startDate);
    }
    if (endDate) {
      aggregateQuery = aggregateQuery.lte("created_at", endDate);
    }

    const { data: allLogs } = await aggregateQuery;

    const totalSavingsUsd = allLogs?.reduce((sum, log) => sum + Number(log.savings_usd), 0) || 0;
    const avgSavingsPerBooking = allLogs?.length 
      ? Math.round((totalSavingsUsd / allLogs.length) * 100) / 100 
      : 0;

    // Count by product type
    const byProductType: Record<string, { count: number; totalSavings: number }> = {};
    allLogs?.forEach(log => {
      if (!byProductType[log.product_type]) {
        byProductType[log.product_type] = { count: 0, totalSavings: 0 };
      }
      byProductType[log.product_type].count++;
      byProductType[log.product_type].totalSavings += Number(log.savings_usd);
    });

    // Export CSV if requested
    if (exportCsv) {
      const { data: allExportLogs } = await supabase
        .from("fx_smart_save_logs")
        .select("*")
        .order("created_at", { ascending: false });

      const csvHeader = "id,booking_id,product_type,original_currency,original_amount,recommended_currency,recommended_amount,savings_usd,created_at\n";
      const csvRows = allExportLogs?.map(log => 
        `${log.id},${log.booking_id || ""},${log.product_type},${log.original_currency},${log.original_amount},${log.recommended_currency},${log.recommended_amount},${log.savings_usd},${log.created_at}`
      ).join("\n") || "";

      return new Response(csvHeader + csvRows, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="fx-smartsave-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const result = {
      logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      aggregates: {
        totalSavingsUsd: Math.round(totalSavingsUsd * 100) / 100,
        avgSavingsPerBooking,
        totalTransactions: allLogs?.length || 0,
        byProductType,
      },
    };

    console.log(`[fx-admin-stats] Admin fetched stats: ${allLogs?.length} logs, $${totalSavingsUsd} total savings`);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[fx-admin-stats] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch FX stats" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
