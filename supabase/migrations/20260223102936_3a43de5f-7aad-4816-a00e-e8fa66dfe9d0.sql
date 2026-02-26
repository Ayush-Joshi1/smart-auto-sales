
-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only service role can modify products" ON public.products FOR ALL USING (false);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  special_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  order_id TEXT,
  sentiment TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own complaints" ON public.complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner access policies (using service role in edge functions)
-- Owner will access data through edge functions with elevated privileges

-- Seed products
INSERT INTO public.products (product_id, name, price, stock) VALUES
('PRD-001', 'Smart Anti-Theft Backpack', 80.00, 50),
('PRD-002', 'Gaming Desktop RTX 4070', 2250.00, 15),
('PRD-003', 'Gaming Desktop RTX 4071', 130.00, 25),
('PRD-004', 'Smart Blood Pressure Monitor', 65.00, 60),
('PRD-005', 'Smart LED Makeup Mirror', 45.00, 80),
('PRD-006', 'Smart Essential Oil Diffuser', 25.00, 100),
('PRD-007', 'Induction Cooktop', 750.00, 20),
('PRD-008', 'Smart Wall Oven', 1200.00, 10),
('PRD-009', 'Smart Power Drill Kit', 120.00, 35),
('PRD-010', 'Smart Yoga Mat', 110.00, 45),
('PRD-011', '4K Webcam with Autofocus', 95.00, 55),
('PRD-012', 'Smart Toaster Oven', 65.00, 70),
('PRD-013', 'Smart Jump Rope', 30.00, 90),
('PRD-014', 'Smart Exercise Bike', 1800.00, 8),
('PRD-015', 'Color-Changing Smart Light Bulb', 15.00, 200),
('PRD-016', 'Smart Power Strip with USB', 35.00, 120),
('PRD-017', 'Smart Microwave Oven', 150.00, 30),
('PRD-018', 'Smart Treadmill', 2500.00, 5),
('PRD-019', 'Smart Washer', 850.00, 12),
('PRD-020', 'Robotic Vacuum Cleaner', 350.00, 25),
('PRD-021', 'Espresso Machine with Grinder', 250.00, 20),
('PRD-022', 'Smart Carry-On Luggage', 250.00, 30),
('PRD-023', 'Portable Air Conditioner', 400.00, 18),
('PRD-024', 'Smart Document Scanner', 150.00, 40),
('PRD-025', 'Digital Voice Recorder with Transcription', 70.00, 50),
('PRD-026', 'Portable Photo Printer', 90.00, 35),
('PRD-027', 'Home Security Camera System', 300.00, 22),
('PRD-028', 'Smart Home Hub', 85.00, 65),
('PRD-029', 'Smart Home Speaker with AI', 120.00, 40),
('PRD-030', 'Portable Car Jump Starter', 85.00, 45),
('PRD-031', 'Smart Wine Opener', 45.00, 75),
('PRD-032', 'Indoor Electric Grill', 55.00, 60),
('PRD-033', 'Smart Body Composition Scale', 45.00, 55),
('PRD-034', 'Percussion Massage Gun', 99.00, 40),
('PRD-035', 'Electric Shaver', 70.00, 50),
('PRD-036', 'Smart Hair Dryer', 180.00, 30),
('PRD-037', 'HEPA Air Purifier', 220.00, 25),
('PRD-038', 'Smart Humidifier', 50.00, 70),
('PRD-039', 'Smart Water Bottle', 35.00, 85),
('PRD-040', 'Smart Electric Kettle', 60.00, 65),
('PRD-041', 'Smart Steam Iron', 40.00, 80),
('PRD-042', 'Wearable Fitness Tracker', 79.00, 90),
('PRD-043', 'Heated Winter Gloves', 65.00, 40),
('PRD-044', 'Smart Heated Jacket', 150.00, 20),
('PRD-045', 'Smart Air Pump for Tires', 85.00, 55),
('PRD-046', 'Smart Robotic Lawn Mower', 1000.00, 7),
('PRD-047', 'GPS Pet Collar', 55.00, 60),
('PRD-048', 'Smart Pet Feeder', 75.00, 45),
('PRD-049', 'Smart TV Box with 8K Support', 200.00, 35),
('PRD-050', '4K Laser Projector', 1500.00, 10),
('PRD-051', 'Soundbar with Subwoofer', 350.00, 20),
('PRD-052', 'Wireless Charging Dock Station', 45.00, 100),
('PRD-053', 'Portable Power Bank with PD', 50.00, 80),
('PRD-054', 'Braided USB-C Cable 2-Pack', 20.00, 150),
('PRD-055', '1TB Portable SSD', 120.00, 40),
('PRD-056', 'Smart Light Switch 4-Pack', 60.00, 55),
('PRD-057', 'Smart Electric Blanket', 80.00, 35),
('PRD-058', 'Smart Umbrella with GPS', 40.00, 60),
('PRD-059', 'Smart Self-Cleaning Water Bottle', 55.00, 50),
('PRD-060', 'Smart Rice Cooker', 95.00, 45),
('PRD-061', 'Digital Air Fryer with Presets', 110.00, 30),
('PRD-062', 'Smart Tablet for Kids', 99.00, 25),
('PRD-063', 'Smart GPS Wallet', 60.00, 40),
('PRD-064', 'Smart Heated Socks', 50.00, 55),
('PRD-065', 'Smart Audio Sunglasses', 120.00, 30),
('PRD-066', 'Mesh Wi-Fi System (3-Pack)', 250.00, 20),
('PRD-067', 'Smart Kitchen Scale', 30.00, 100);
