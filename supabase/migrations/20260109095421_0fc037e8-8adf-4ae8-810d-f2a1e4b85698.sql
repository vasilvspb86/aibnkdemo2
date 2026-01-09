-- Create trigger to update account balance when transactions are inserted
CREATE TRIGGER update_balance_on_transaction_insert
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance_on_transaction();

-- Create trigger to handle transaction updates (e.g., cancelled/failed)
CREATE TRIGGER update_balance_on_transaction_update
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance_on_transaction_update();