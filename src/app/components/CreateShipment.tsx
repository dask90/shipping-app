import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Progress } from '@/app/components/ui/progress';
import { ArrowLeft, Package, MapPin, DollarSign, CheckCircle } from 'lucide-react';

interface CreateShipmentProps {
  onNavigate: (screen: string) => void;
}

import { useShipment } from '@/app/context/ShipmentContext';
import { toast } from 'sonner';

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center text-xs">Loading Map...</div>
});

export function CreateShipment({ onNavigate }: CreateShipmentProps) {
  const { createShipment } = useShipment();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    itemName: '',
    weight: '',
    dimensions: '',
    description: '',
    pickupType: 'office',
    pickupAddress: '',
    destinationCity: '',
    destinationAddress: '',
    recipientName: '',
    recipientPhone: '',
    fromLat: 5.6037,
    fromLng: -0.1870,
    toLat: 6.6666,
    toLng: -1.6163
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!formData.itemName) { toast.error("Item Name is required"); return false; }
        if (!formData.weight) { toast.error("Weight is required"); return false; }
        return true;
      case 2:
        if (formData.pickupType === 'pickup' && !formData.pickupAddress) {
          toast.error("Pickup Address is required"); return false;
        }
        return true;
      case 3:
        if (!formData.destinationCity) { toast.error("Destination City is required"); return false; }
        if (!formData.destinationAddress) { toast.error("Destination Address is required"); return false; }
        if (!formData.recipientName) { toast.error("Recipient Name is required"); return false; }
        if (!formData.recipientPhone) { toast.error("Recipient Phone is required"); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete shipment
      const newShipment = {
        customerName: "Current User", // In a real app, get from auth
        customerPhone: "+233 55 123 4567",
        fromCity: formData.pickupType === 'office' ? 'Accra Office' : 'Accra', // Simplified
        toCity: formData.destinationCity,
        price: formData.pickupType === 'pickup' ? '₵74.75' : '₵65.55',
        status: 'pending_approval' as const,
        description: formData.itemName,
        weight: `${formData.weight} kg`,
        pickupAddress: formData.pickupAddress || 'Accra Office Drop-off',
        deliveryAddress: formData.destinationAddress,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        fromLat: formData.fromLat,
        fromLng: formData.fromLng,
        toLat: formData.toLat,
        toLng: formData.toLng
      };

      createShipment(newShipment);
      toast.success("Shipment Created Successfully!");
      onNavigate('dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center mb-4 text-blue-100 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl mb-2">Create Shipment</h1>
          <div className="flex items-center justify-between text-sm text-blue-100">
            <span>Step {step} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="mt-3 h-2 bg-blue-900" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Step 1: Item Details */}
        {step === 1 && (
          <Card className="p-6 shadow-md">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2>Item Details</h2>
                <p className="text-sm text-muted-foreground">Tell us what you're shipping</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  placeholder="e.g., Electronics, Documents"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="0.0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (cm)</Label>
                  <Input
                    id="dimensions"
                    placeholder="L × W × H"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any special handling instructions"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Pickup Details */}
        {step === 2 && (
          <Card className="p-6 shadow-md">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2>Pickup Details</h2>
                <p className="text-sm text-muted-foreground">How should we collect the item?</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Pickup Option</Label>
                <RadioGroup
                  value={formData.pickupType}
                  onValueChange={(value) => setFormData({ ...formData, pickupType: value })}
                >
                  <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="office" id="office" />
                      <Label htmlFor="office" className="flex-1 cursor-pointer">
                        <div>Drop-off at Office</div>
                        <div className="text-sm text-muted-foreground">
                          Visit our nearest branch
                        </div>
                      </Label>
                    </div>
                  </Card>

                  <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div>Pickup at Location</div>
                        <div className="text-sm text-muted-foreground">
                          We'll come to collect
                        </div>
                      </Label>
                    </div>
                  </Card>
                </RadioGroup>
              </div>

              {formData.pickupType === 'pickup' && (
                <div className="space-y-2">
                  <Label>Select Pickup Location</Label>
                  {/* Google Maps Placeholder */}
                  <div className="w-full h-64 bg-muted rounded-lg border-2 border-border relative overflow-hidden group shadow-inner">
                    <MapPicker
                      onLocationSelect={(_, __, address) => {
                        if (address) {
                          setFormData({ ...formData, pickupAddress: address });
                          toast.success("Location pinned!");
                        }
                      }}
                    />
                  </div>

                  <Label htmlFor="pickupAddress">Address Details</Label>
                  <Textarea
                    id="pickupAddress"
                    placeholder="Enter complete address with landmark"
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    rows={2}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 3: Destination Details */}
        {step === 3 && (
          <Card className="p-6 shadow-md">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2>Destination Details</h2>
                <p className="text-sm text-muted-foreground">Where should we deliver?</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destinationCity">Destination City</Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                  >
                    <option value="">Select city</option>
                    <option value="Accra">Accra</option>
                    <option value="Kumasi">Kumasi</option>
                    <option value="Tamale">Tamale</option>
                    <option value="Takoradi">Takoradi</option>
                    <option value="Tema">Tema</option>
                    <option value="Cape Coast">Cape Coast</option>
                    <option value="Sunyani">Sunyani</option>
                    <option value="Koforidua">Koforidua</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Delivery Location</Label>
                {/* Google Maps Placeholder */}
                <div className="w-full h-64 bg-muted rounded-lg border-2 border-border relative overflow-hidden group shadow-inner">
                  <MapPicker
                    onLocationSelect={(_, __, address) => {
                      if (address) {
                        setFormData({ ...formData, destinationAddress: address });
                        toast.success("Location pinned!");
                      }
                    }}
                    initialPos={formData.destinationCity === 'Kumasi' ? [6.6666, -1.6163] : [5.6037, -0.1870]}
                  />
                </div>

                <Label htmlFor="destinationAddress">Delivery Address</Label>
                <Textarea
                  id="destinationAddress"
                  placeholder="Enter complete address with landmark"
                  value={formData.destinationAddress}
                  onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  placeholder="Full name"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Recipient Phone</Label>
                <Input
                  id="recipientPhone"
                  type="tel"
                  placeholder="(+233) Contact number"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Pricing Summary */}
        {step === 4 && (
          <Card className="p-6 shadow-md">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2>Pricing Summary</h2>
                <p className="text-sm text-muted-foreground">Review your shipment details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Shipment Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Item</span>
                  <span>{formData.itemName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weight</span>
                  <span>{formData.weight ? `${formData.weight} kg` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Route</span>
                  <span>Accra → {formData.destinationCity || 'Kumasi'}</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Base Fare</span>
                  <span>₵45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weight Charges</span>
                  <span>₵12</span>
                </div>
                {formData.pickupType === 'pickup' && (
                  <div className="flex justify-between text-sm">
                    <span>Pickup Charges</span>
                    <span>₵8</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>VAT / Tax (15%)</span>
                  <span>₵{formData.pickupType === 'pickup' ? '9.75' : '8.55'}</span>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span>Total Amount</span>
                    <span className="text-2xl text-primary">
                      ₵{formData.pickupType === 'pickup' ? '74.75' : '65.55'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start mt-4">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  Estimated delivery: 2-3 business days
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1"
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {step === totalSteps ? 'Confirm & Pay' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
