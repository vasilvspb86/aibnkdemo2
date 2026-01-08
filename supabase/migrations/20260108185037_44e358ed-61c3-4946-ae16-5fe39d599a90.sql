-- Create function to update account balance when transaction is created
CREATE OR REPLACE FUNCTION public.update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the account balance based on transaction type
  IF NEW.type = 'credit' THEN
    UPDATE public.accounts 
    SET 
      balance = balance + NEW.amount,
      available_balance = available_balance + NEW.amount,
      updated_at = now()
    WHERE id = NEW.account_id;
  ELSIF NEW.type = 'debit' THEN
    UPDATE public.accounts 
    SET 
      balance = balance - NEW.amount,
      available_balance = available_balance - NEW.amount,
      updated_at = now()
    WHERE id = NEW.account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run after transaction insert
CREATE TRIGGER update_balance_after_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance_on_transaction();

-- Also handle transaction status changes (e.g., pending -> completed or reversed)
CREATE OR REPLACE FUNCTION public.update_account_balance_on_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If transaction was pending and is now completed, no balance change needed
  -- (balance was already adjusted on insert)
  
  -- If transaction is being reversed/cancelled, reverse the balance change
  IF OLD.status != 'failed' AND NEW.status = 'failed' THEN
    IF NEW.type = 'credit' THEN
      UPDATE public.accounts 
      SET 
        balance = balance - NEW.amount,
        available_balance = available_balance - NEW.amount,
        updated_at = now()
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'debit' THEN
      UPDATE public.accounts 
      SET 
        balance = balance + NEW.amount,
        available_balance = available_balance + NEW.amount,
        updated_at = now()
      WHERE id = NEW.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for transaction updates
CREATE TRIGGER update_balance_after_transaction_update
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance_on_transaction_update();