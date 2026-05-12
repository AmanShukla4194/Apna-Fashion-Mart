'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { createInquiry } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CustomerInquiryForm = ({ storeId, storeName, productId, productName }) => {
  const { currentUser, profile, isCustomer } = useAuth();
  const [inquiryType, setInquiryType] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isCustomer) {
      toast.error('Please login as a customer to send inquiries');
      return;
    }

    setLoading(true);
    try {
      await createInquiry({
        store_id: storeId,
        product_id: productId || null,
        inquiry_type: inquiryType,
        message,
      });

      toast.success('Inquiry sent successfully');
      setInquiryType('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-premium">
      <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
        Ask a Question
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Inquiry Type</label>
          <Select value={inquiryType} onValueChange={setInquiryType} required>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="size">Size Information</SelectItem>
              <SelectItem value="stock">Stock Availability</SelectItem>
              <SelectItem value="availability">Product Availability</SelectItem>
              <SelectItem value="delivery">Delivery Details</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Your Message</label>
          <Textarea
            placeholder="Type your question here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="rounded-xl min-h-32"
          />
        </div>

        <Button
          type="submit"
          className="w-full btn-primary flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            'Sending...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Inquiry
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default CustomerInquiryForm;
