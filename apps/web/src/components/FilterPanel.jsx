'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

const FilterPanel = ({ filters, onFilterChange }) => {
  return (
    <Card className="card-premium sticky top-24">
      <h3 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
        Filters
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Distance</h4>
          <RadioGroup value={filters?.distance} onValueChange={(value) => onFilterChange?.({ distance: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="5km" />
              <Label htmlFor="5km">Within 5 km</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10" id="10km" />
              <Label htmlFor="10km">Within 10 km</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h4 className="font-medium mb-3">Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`}>{rating}+ Stars</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Price Range</h4>
          <Slider 
            defaultValue={[0, 5000]} 
            max={10000} 
            step={100}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹0</span>
            <span>₹10,000</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Verification</h4>
          <div className="flex items-center space-x-2">
            <Checkbox id="verified" />
            <Label htmlFor="verified">Verified Sellers Only</Label>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FilterPanel;
