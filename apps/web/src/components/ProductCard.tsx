import { component$, useSignal, useStyles$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Button, Card } from "@acme/ui";

export interface Product {
  id: string;
  title: string;
  description: any[]; // Rich text content
  price: number;
  variants: {
    id: string;
    size: string;
    color: string;
    stock: number;
    additionalPrice: number;
  }[];
  images?: {
    url: string;
  }[];
}

export interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
  additionalPrice: number;
}

export const ProductCard = component$((props: { product: Product }) => {
  const { product } = props;
  const selectedVariant = useSignal<Variant | null>(null);
  const quantity = useSignal(1);

  // Set the first variant as default if none is selected
  if (!selectedVariant.value && product.variants && product.variants.length > 0) {
    selectedVariant.value = product.variants[0];
  }

  const finalPrice = selectedVariant.value
    ? product.price + selectedVariant.value.additionalPrice
    : product.price;

  return (
    <Card class="overflow-hidden flex flex-col h-full">
      <div class="h-48 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            class="w-full h-full object-cover"
          />
        ) : (
          <div class="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
      </div>

      <div class="p-4 flex flex-col flex-grow">
        <h3 class="text-lg font-semibold mb-2">{product.title}</h3>

        <div class="text-xl font-bold text-blue-600 mb-3">
          ${finalPrice.toFixed(2)}
        </div>

        <div class="mb-4 flex-grow">
          <h4 class="font-medium mb-2">Options:</h4>
          <div class="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                class={{
                  'px-3 py-1 rounded border transition-colors': true,
                  'border-blue-500 bg-blue-500 text-white': selectedVariant.value?.id === variant.id,
                  'border-gray-300': selectedVariant.value?.id !== variant.id,
                  'opacity-50 cursor-not-allowed': variant.stock <= 0,
                  'hover:bg-blue-100': selectedVariant.value?.id !== variant.id && variant.stock > 0
                }}
                onClick$={() => selectedVariant.value = variant}
                disabled={variant.stock <= 0}
              >
                {variant.size} / {variant.color}
                {variant.additionalPrice > 0 && ` (+$${variant.additionalPrice.toFixed(2)})`}
                {variant.stock <= 0 && ' (Out of Stock)'}
              </button>
            ))}
          </div>
        </div>

        <div class="mt-auto">
          <Button
            variant="primary"
            class="w-full py-3"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
});