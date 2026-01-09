-- Create spending alerts table
CREATE TABLE public.spending_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('daily_limit', 'weekly_limit', 'monthly_limit', 'category_limit', 'trend_warning', 'large_transaction')),
  threshold_amount NUMERIC NOT NULL,
  category TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_sent_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spending_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their spending alerts"
ON public.spending_alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create spending alerts"
ON public.spending_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their spending alerts"
ON public.spending_alerts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their spending alerts"
ON public.spending_alerts
FOR DELETE
USING (auth.uid() = user_id);

-- Demo org policies
CREATE POLICY "Authenticated users can view demo spending alerts"
ON public.spending_alerts
FOR SELECT
USING (organization_id = '11111111-1111-1111-1111-111111111111');

CREATE POLICY "Authenticated users can create demo spending alerts"
ON public.spending_alerts
FOR INSERT
WITH CHECK (organization_id = '11111111-1111-1111-1111-111111111111');

CREATE POLICY "Authenticated users can update demo spending alerts"
ON public.spending_alerts
FOR UPDATE
USING (organization_id = '11111111-1111-1111-1111-111111111111');

CREATE POLICY "Authenticated users can delete demo spending alerts"
ON public.spending_alerts
FOR DELETE
USING (organization_id = '11111111-1111-1111-1111-111111111111');

-- Trigger for updated_at
CREATE TRIGGER update_spending_alerts_updated_at
BEFORE UPDATE ON public.spending_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();