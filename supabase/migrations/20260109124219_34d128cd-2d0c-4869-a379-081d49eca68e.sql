-- Add UPDATE policy for transactions table to allow status updates for demo account
CREATE POLICY "Authenticated users can update demo transactions" 
ON public.transactions 
FOR UPDATE 
USING (account_id = '22222222-2222-2222-2222-222222222222'::uuid);