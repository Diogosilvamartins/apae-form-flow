-- Update auth.users to confirm all existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now()
WHERE email_confirmed_at IS NULL;