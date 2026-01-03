import { component$, useSignal, useTask$, useStyles$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { ProductCard } from "~/components/ProductCard";
import { useGraphQL } from "~/utils/graphql-client";
import { Card } from "@acme/ui";


export default component$(() => {
  const { executeQuery } = useGraphQL();
  const products = useSignal<any[]>([]);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);

  useTask$(async () => {
    try {
      const query = `
        query GetProducts {
          Products {
            docs {
              id
              title
              description
              price
              variants {
                id
                size
                color
                stock
                additionalPrice
              }
              images {
                url
              }
            }
          }
        }
      `;

      const data = await executeQuery(query);
      products.value = data.Products.docs;
    } catch (err) {
      console.error('Error fetching products:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load products';
    } finally {
      loading.value = false;
    }
  });

  return (
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Our Products</h1>

      {loading.value && (
        <Card class="p-6 text-center">
          <p>Loading products...</p>
        </Card>
      )}

      {error.value && (
        <Card class="p-6 bg-red-50 border border-red-200">
          <p class="text-red-600">Error: {error.value}</p>
        </Card>
      )}

      {!loading.value && !error.value && (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.value.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "E-commerce Store",
  meta: [
    {
      name: "description",
      content: "Browse our collection of premium products",
    },
  ],
};
