'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getStoreInquiries, respondToInquiry } from '@/lib/api';
import { toast } from 'sonner';

const InquiryManagement = ({ storeId }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    if (storeId) fetchInquiries();
  }, [storeId]);

  const fetchInquiries = async () => {
    try {
      const data = await getStoreInquiries(storeId);
      setInquiries(data);
    } catch (error) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (inquiryId) => {
    const response = replyText[inquiryId];
    if (!response?.trim()) return;

    try {
      await respondToInquiry(inquiryId, response);
      toast.success('Reply sent successfully');
      setReplyText({ ...replyText, [inquiryId]: '' });
      fetchInquiries();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading inquiries...</div>;
  }

  if (inquiries.length === 0) {
    return (
      <Card className="card-premium text-center py-12">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No customer inquiries yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id} className="card-premium">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold">{inquiry.profiles?.name || 'Customer'}</h4>
              <p className="text-sm text-muted-foreground">{inquiry.profiles?.email}</p>
            </div>
            <Badge variant={inquiry.status === 'open' ? 'destructive' : 'secondary'}>
              {inquiry.status}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{inquiry.inquiry_type}</Badge>
              {inquiry.products?.name && (
                <span className="text-sm text-muted-foreground">Re: {inquiry.products.name}</span>
              )}
            </div>
            <p className="text-foreground">{inquiry.message}</p>
          </div>

          {inquiry.response ? (
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm font-medium mb-2">Your Response:</p>
              <p className="text-foreground">{inquiry.response}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Type your response..."
                value={replyText[inquiry.id] || ''}
                onChange={(e) => setReplyText({ ...replyText, [inquiry.id]: e.target.value })}
                className="rounded-xl"
              />
              <Button
                className="btn-primary flex items-center gap-2"
                onClick={() => handleReply(inquiry.id)}
              >
                <Send className="w-4 h-4" />
                Send Reply
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default InquiryManagement;
