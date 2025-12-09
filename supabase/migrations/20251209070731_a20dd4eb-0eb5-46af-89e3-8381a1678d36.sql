-- Assign admin role to info@kapitallo.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('ac8a841f-d1d1-46f1-a73d-4088215b77ab', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;