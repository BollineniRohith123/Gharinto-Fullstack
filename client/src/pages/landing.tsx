import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Palette, 
  Store, 
  UserCheck, 
  Building, 
  IdCard, 
  Star,
  CheckCircle,
  Users,
  Clock,
  Shield,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Quote
} from "lucide-react";

export default function Landing() {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [cities, setCities] = useState<Array<{id: string, name: string, state: string}>>([]);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    projectType: '',
    budget: '',
    description: ''
  });
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    role: '',
    city: '',
    experience: '',
    description: ''
  });

  const handleLogin = () => {
    window.location.href = "/auth/login";
  };

  useEffect(() => {
    // Fetch cities from API
    fetch('/api/cities')
      .then(response => response.json())
      .then(data => setCities(data))
      .catch(error => console.error('Error fetching cities:', error));
  }, []);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteForm),
      });

      if (response.ok) {
        // Reset form and show success message
        setQuoteForm({
          name: '',
          email: '',
          phone: '',
          city: '',
          projectType: '',
          budget: '',
          description: ''
        });
        setShowQuoteForm(false);
        alert('Thank you! We will contact you within 24 hours.');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to submit quote request'}`);
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Error submitting quote request. Please try again.');
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerForm),
      });

      if (response.ok) {
        // Reset form and show success message
        setPartnerForm({
          name: '',
          email: '',
          phone: '',
          businessName: '',
          role: '',
          city: '',
          experience: '',
          description: ''
        });
        setShowPartnerForm(false);
        alert('Thank you! Our team will review your application and contact you soon.');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to submit registration'}`);
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Error submitting registration. Please try again.');
    }
  };

  // Sample testimonials - in production, these would come from API
  const testimonials = [
    {
      id: 1,
      clientName: "Rajesh & Priya Sharma",
      projectTitle: "3BHK Modern Home",
      testimonialText: "Gharinto transformed our home beyond our expectations. The transparency in pricing and timeline was exceptional. Our designer was professional and the quality of work was outstanding.",
      rating: 5,
      clientImage: "/api/placeholder/100/100"
    },
    {
      id: 2,
      clientName: "Amit Patel",
      projectTitle: "Luxury Villa Interior",
      testimonialText: "Best decision ever! From initial consultation to final handover, everything was smooth. The project was completed on time and within budget. Highly recommended!",
      rating: 5,
      clientImage: "/api/placeholder/100/100"
    },
    {
      id: 3,
      clientName: "Sneha & Vikram",
      projectTitle: "Modular Kitchen Design",
      testimonialText: "The team at Gharinto is simply amazing. They understood our requirements perfectly and delivered a beautiful kitchen that our family loves. Great customer service!",
      rating: 5,
      clientImage: "/api/placeholder/100/100"
    },
    {
      id: 4,
      clientName: "Dr. Sunita Gupta",
      projectTitle: "Office Cabin Interiors",
      testimonialText: "Professional, reliable, and creative. Gharinto helped us create a workspace that truly reflects our brand. The attention to detail was remarkable.",
      rating: 5,
      clientImage: "/api/placeholder/100/100"
    },
    {
      id: 5,
      clientName: "Rohit & Kavya",
      projectTitle: "Apartment Makeover",
      testimonialText: "From concept to completion, Gharinto exceeded our expectations. The quality of materials and craftsmanship was top-notch. We couldn't be happier with our new home!",
      rating: 5,
      clientImage: "/api/placeholder/100/100"
    }
  ];

  const partnerRoles = [
    { value: 'designer', label: 'Interior Designer' },
    { value: 'vendor', label: 'Vendor/Supplier' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'builder', label: 'Builder/Developer' }
  ];



  const projectTypes = [
    'Full Home Interior', 'Modular Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Office Space'
  ];

  const budgetRanges = [
    'Under ₹5 Lakhs', '₹5-10 Lakhs', '₹10-20 Lakhs', '₹20-50 Lakhs', 'Above ₹50 Lakhs'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-white to-green-50/60">
      {/* Header Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mr-3">
                <Home className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                Gharinto
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowQuoteForm(true)}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Quote className="w-4 h-4 mr-2" />
                Get Free Quote
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPartnerForm(true)}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Become a Partner
              </Button>
              <Button onClick={handleLogin} className="bg-green-600 hover:bg-green-700">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-700 via-green-600 to-green-500 bg-clip-text text-transparent">
              Transform Your Home
            </span>
            <br />
            <span className="text-gray-900">With India's Most Trusted</span>
            <br />
            <span className="text-gray-900">Interior Design Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience transparent pricing, predictable timelines, and exceptional quality. 
            Connect with verified designers and trusted vendors for your dream home transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowQuoteForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
            >
              <Quote className="w-5 h-5 mr-2" />
              Get Your Free Quote
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowPartnerForm(true)}
              className="border-green-200 text-green-700 hover:bg-green-50 px-8 py-4 text-lg"
            >
              Join as Partner
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Gharinto Works</h2>
            <p className="text-xl text-gray-600">Simple, transparent, and efficient process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Share Your Vision",
                description: "Tell us about your space, style preferences, and budget",
                icon: <Quote className="w-8 h-8" />
              },
              {
                step: 2,
                title: "Get Matched",
                description: "We connect you with verified designers in your city",
                icon: <Users className="w-8 h-8" />
              },
              {
                step: 3,
                title: "Design & Plan",
                description: "Collaborate on designs, materials, and timeline",
                icon: <Palette className="w-8 h-8" />
              },
              {
                step: 4,
                title: "Transform & Enjoy",
                description: "Track progress in real-time and enjoy your new space",
                icon: <CheckCircle className="w-8 h-8" />
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-green-600">
                    {item.icon}
                  </div>
                </div>
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-green-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real stories from real customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="border-green-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.clientName}</h4>
                      <p className="text-sm text-gray-600">{testimonial.projectTitle}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.testimonialText}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Gharinto?</h2>
            <p className="text-xl text-gray-600">Experience the difference with our platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Transparent Pricing",
                description: "No hidden costs. Get detailed quotes with complete material and labor breakdown.",
                icon: <Shield className="w-8 h-8" />,
                color: "green"
              },
              {
                title: "On-Time Delivery",
                description: "Track progress in real-time. 95% of our projects complete on schedule.",
                icon: <Clock className="w-8 h-8" />,
                color: "blue"
              },
              {
                title: "Quality Assured",
                description: "Verified vendors, quality checks at every stage, and comprehensive warranties.",
                icon: <CheckCircle className="w-8 h-8" />,
                color: "purple"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <div className={`text-${feature.color}-600`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Space?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trusted Gharinto with their dream homes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowQuoteForm(true)}
              className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
            >
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowPartnerForm(true)}
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2">
                  <Home className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold">Gharinto</span>
              </div>
              <p className="text-gray-400">Transforming homes across India with transparency and excellence.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Full Home Interiors</li>
                <li>Modular Kitchens</li>
                <li>Office Spaces</li>
                <li>Renovation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Our Process</li>
                <li>Quality Promise</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  1800-123-4567
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  hello@gharinto.com
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Available in 8+ cities
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Gharinto. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-green-700">Get Your Free Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select value={quoteForm.city} onValueChange={(value) => setQuoteForm(prev => ({ ...prev, city: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.id}>{city.name}, {city.state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select value={quoteForm.projectType} onValueChange={(value) => setQuoteForm(prev => ({ ...prev, projectType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget Range *</Label>
                    <Select value={quoteForm.budget} onValueChange={(value) => setQuoteForm(prev => ({ ...prev, budget: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map(range => (
                          <SelectItem key={range} value={range}>{range}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={quoteForm.description}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell us about your project requirements..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1">
                    Submit Quote Request
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowQuoteForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Partner Form Modal */}
      {showPartnerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-green-700">Become a Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partnerName">Full Name *</Label>
                    <Input
                      id="partnerName"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerEmail">Email *</Label>
                    <Input
                      id="partnerEmail"
                      type="email"
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerPhone">Phone *</Label>
                    <Input
                      id="partnerPhone"
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={partnerForm.businessName}
                      onChange={(e) => setPartnerForm(prev => ({ ...prev, businessName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerRole">Partner Type *</Label>
                    <Select value={partnerForm.role} onValueChange={(value) => setPartnerForm(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select partner type" />
                      </SelectTrigger>
                      <SelectContent>
                        {partnerRoles.map(role => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="partnerCity">City *</Label>
                    <Select value={partnerForm.city} onValueChange={(value) => setPartnerForm(prev => ({ ...prev, city: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.id}>{city.name}, {city.state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={partnerForm.experience}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerDescription">Tell us about your business</Label>
                  <Textarea
                    id="partnerDescription"
                    value={partnerForm.description}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your services, specializations, and why you'd like to partner with us..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1">
                    Submit Partnership Application
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowPartnerForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
