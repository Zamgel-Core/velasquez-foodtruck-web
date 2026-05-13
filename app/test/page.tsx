import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Test Supabase
      </h1>

      <pre>
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </div>
  );
}