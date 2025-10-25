import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Headphones, Laptop, TrendingUp, Users, Scale, GraduationCap, DollarSign, Rocket, Heart, Clock, Mail } from "lucide-react";
import heroImage from "@/assets/careers-hero.jpg";
import teamImage from "@/assets/careers-team.jpg";
import celebrationImage from "@/assets/careers-celebration.jpg";
import hiringImage from "@/assets/careers-hiring.jpg";
import mapImage from "@/assets/careers-map.jpg";
import workspaceImage from "@/assets/careers-workspace.jpg";
import brainstormImage from "@/assets/careers-brainstorm.jpg";
import remoteImage from "@/assets/careers-remote.jpg";

const positions = [
  {
    title: "Travel Consultant (Domestic & International)",
    icon: Briefcase,
    description: "Help customers plan their dream journeys with personalized travel solutions."
  },
  {
    title: "Customer Support Executive",
    icon: Headphones,
    description: "Provide exceptional support and ensure customer satisfaction at every touchpoint."
  },
  {
    title: "Web / Software / Mobile App Developer",
    icon: Laptop,
    description: "Build innovative travel technology solutions that scale to millions of users."
  },
  {
    title: "Digital Marketing Executive",
    icon: TrendingUp,
    description: "Drive growth through creative campaigns and data-driven marketing strategies."
  },
  {
    title: "Legal Counsel",
    icon: Scale,
    description: "Ensure compliance and provide legal guidance for our expanding operations."
  },
  {
    title: "Human Resources (HR)",
    icon: Users,
    description: "Shape our culture and help build a world-class team of travel enthusiasts."
  },
  {
    title: "Internship Opportunities",
    icon: GraduationCap,
    description: "Kickstart your career with hands-on experience in the travel industry."
  }
];

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Pay",
    description: "Industry-leading compensation and performance bonuses"
  },
  {
    icon: Rocket,
    title: "Career Growth & Learning",
    description: "Continuous learning opportunities and career advancement"
  },
  {
    icon: Heart,
    title: "Inclusive Environment",
    description: "A diverse, welcoming workplace where everyone belongs"
  },
  {
    icon: Clock,
    title: "Flexibility & Balance",
    description: "Flexible work arrangements and work-life balance"
  }
];

const Careers = () => {
  const scrollToPositions = () => {
    const positionsSection = document.getElementById('open-positions');
    positionsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Come & Join Cheap Travel
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 animate-fade-in">
            Helping India Travel Affordably and Seamlessly for the Past Several Years.
          </p>
          <Button 
            size="lg" 
            onClick={scrollToPositions}
            className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg animate-fade-in"
          >
            Explore Opportunities
          </Button>
        </div>
      </section>

      {/* About & Mission */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Are you passionate about travel, innovation, and creating unforgettable experiences? 
                Join our fast-paced, collaborative, and growing team at Cheap Travel, where every 
                idea counts and every individual matters. We're building the future of affordable 
                travel for the world, one journey at a time.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src={teamImage} 
                alt="Team collaboration" 
                className="rounded-2xl shadow-lg w-full h-auto hover-scale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={workspaceImage} 
                alt="Happy workplace" 
                className="rounded-2xl shadow-lg w-full h-auto hover-scale"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Why Work With Cheap Travel?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                We believe in empowering our team to innovate, grow, and make a real impact. 
                Our inclusive culture celebrates diversity, encourages creativity, and supports 
                professional development at every stage of your career.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join a company that's transforming how millions of Indians experience travel, 
                making it more accessible, affordable, and enjoyable for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <img 
              src={hiringImage} 
              alt="We're hiring" 
              className="mx-auto mb-8 w-full max-w-2xl rounded-2xl shadow-lg"
            />
            <h2 className="text-4xl font-bold text-foreground mb-4">Open Positions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore exciting career opportunities and become part of our journey to revolutionize travel for the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {positions.map((position, index) => (
              <Card key={index} className="hover-scale transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg mr-4">
                      <position.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">{position.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {position.description}
                  </p>
                  <Button 
                    asChild 
                    className="w-full bg-primary hover:bg-primary-hover transition-all duration-300"
                  >
                    <a 
                      href="https://docs.google.com/forms/d/e/1FAIpQLSeevvCiJ7JO6iQe9NkKQBgWJYrYOYYdJVUcTuS7SU36JFtSGg/viewform?usp=dialog" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Apply Now
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-gradient-to-br from-accent/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">What We Offer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We invest in our team's success with competitive benefits and a supportive environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover-scale transition-all duration-300">
                <CardContent className="p-8">
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Life at Cheap Flights */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Life at Cheap Flights</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              At Cheap Flights, work feels like a journey filled with learning, collaboration, and fun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-lg hover-scale">
              <img src={workspaceImage} alt="Team workspace" className="w-full h-64 object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover-scale">
              <img src={brainstormImage} alt="Brainstorming session" className="w-full h-64 object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover-scale">
              <img src={remoteImage} alt="Remote work setup" className="w-full h-64 object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg hover-scale">
              <img src={celebrationImage} alt="Office celebration" className="w-full h-64 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Didn't Find the Right Role */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto text-center shadow-xl">
            <CardContent className="p-12">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-6">
                <Mail className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Didn't Find the Right Role?</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We're always on the lookout for talented, travel-loving professionals. 
                If you believe you can add value to our team, we'd love to hear from you.
              </p>
              <p className="text-lg text-foreground mb-6">
                Send your CV and cover letter to:
              </p>
              <a 
                href="mailto:Hr@chyeap.com" 
                className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-300"
              >
                <Mail className="w-6 h-6" />
                Hr@chyeap.com
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Cheap Flights */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">About Cheap Flights</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Cheap Flights is a leading online travel platform, dedicated to making travel 
                affordable and accessible for everyone. With a focus on customer satisfaction and 
                innovative technology, we've helped millions of travelers explore the world without 
                breaking the bank.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our comprehensive services include flight bookings, hotel reservations, car rentals, 
                and customized travel packages for both domestic and international destinations. 
                Join us in our mission to democratize travel across the world.
              </p>
            </div>
            <div>
              <img 
                src={mapImage} 
                alt="Global travel network" 
                className="rounded-2xl shadow-lg w-full h-auto hover-scale"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
