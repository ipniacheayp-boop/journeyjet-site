import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Trash2, User } from "lucide-react";

export interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  passportCountry: string;
  seatPreference: string;
  mealPreference: string;
}

export interface ContactDetails {
  email: string;
  phone: string;
}

interface PassengerFormProps {
  passengers: Passenger[];
  contact: ContactDetails;
  onPassengersChange: (passengers: Passenger[]) => void;
  onContactChange: (contact: ContactDetails) => void;
  disabled?: boolean;
}

const emptyPassenger: Passenger = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  passportNumber: "",
  passportExpiry: "",
  passportCountry: "",
  seatPreference: "",
  mealPreference: "",
};

const PassengerForm = ({ passengers, contact, onPassengersChange, onContactChange, disabled }: PassengerFormProps) => {
  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    onPassengersChange(updated);
  };

  const addPassenger = () => {
    onPassengersChange([...passengers, { ...emptyPassenger }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    onPassengersChange(passengers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {passengers.map((passenger, index) => (
        <Card key={index} className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Passenger {index + 1}
              </CardTitle>
              {index > 0 && (
                <Button variant="ghost" size="sm" onClick={() => removePassenger(index)} disabled={disabled}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input
                  required
                  disabled={disabled}
                  value={passenger.firstName}
                  onChange={(e) => updatePassenger(index, "firstName", e.target.value)}
                  placeholder="As on passport"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input
                  required
                  disabled={disabled}
                  value={passenger.lastName}
                  onChange={(e) => updatePassenger(index, "lastName", e.target.value)}
                  placeholder="As on passport"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  required
                  disabled={disabled}
                  value={passenger.dateOfBirth}
                  onChange={(e) => updatePassenger(index, "dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender <span className="text-destructive">*</span></Label>
                <Select
                  value={passenger.gender}
                  onValueChange={(val) => updatePassenger(index, "gender", val)}
                  disabled={disabled}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nationality <span className="text-destructive">*</span></Label>
                <Input
                  required
                  disabled={disabled}
                  value={passenger.nationality}
                  onChange={(e) => updatePassenger(index, "nationality", e.target.value)}
                  placeholder="e.g. Indian"
                />
              </div>
            </div>

            {/* Passport */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium mb-3 text-muted-foreground">Passport Details</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Passport Number <span className="text-destructive">*</span></Label>
                  <Input
                    required
                    disabled={disabled}
                    value={passenger.passportNumber}
                    onChange={(e) => updatePassenger(index, "passportNumber", e.target.value.toUpperCase())}
                    placeholder="e.g. A1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passport Expiry <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    required
                    disabled={disabled}
                    value={passenger.passportExpiry}
                    onChange={(e) => updatePassenger(index, "passportExpiry", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issuing Country <span className="text-destructive">*</span></Label>
                  <Input
                    required
                    disabled={disabled}
                    value={passenger.passportCountry}
                    onChange={(e) => updatePassenger(index, "passportCountry", e.target.value)}
                    placeholder="e.g. India"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium mb-3 text-muted-foreground">Preferences (Optional)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seat Preference</Label>
                  <Select
                    value={passenger.seatPreference}
                    onValueChange={(val) => updatePassenger(index, "seatPreference", val)}
                    disabled={disabled}
                  >
                    <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="window">Window</SelectItem>
                      <SelectItem value="aisle">Aisle</SelectItem>
                      <SelectItem value="middle">Middle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Meal Preference</Label>
                  <Select
                    value={passenger.mealPreference}
                    onValueChange={(val) => updatePassenger(index, "mealPreference", val)}
                    disabled={disabled}
                  >
                    <SelectTrigger><SelectValue placeholder="Standard" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="halal">Halal</SelectItem>
                      <SelectItem value="kosher">Kosher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addPassenger} disabled={disabled} className="w-full">
        <UserPlus className="w-4 h-4 mr-2" />
        Add Another Passenger
      </Button>

      {/* Contact Details */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Address <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                required
                disabled={disabled}
                value={contact.email}
                onChange={(e) => onContactChange({ ...contact, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number <span className="text-destructive">*</span></Label>
              <Input
                type="tel"
                required
                disabled={disabled}
                value={contact.phone}
                onChange={(e) => onContactChange({ ...contact, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PassengerForm;
