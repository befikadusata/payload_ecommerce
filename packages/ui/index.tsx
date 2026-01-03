import { component$, useStyles$ } from "@builder.io/qwik";
import type { QwikIntrinsicElements } from "@builder.io/qwik";

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  class?: string;
  children?: any;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick$?: () => void;
}

export const Button = component$<ButtonProps>((props) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const variant = props.variant || 'primary';

  return (
    <button
      {...props}
      class={`px-4 py-2 rounded-md font-medium transition-colors ${variantClasses[variant]} ${props.class || ''}`}
    >
      {props.children}
    </button>
  );
});

export interface CardProps {
  class?: string;
  children?: any;
}

export const Card = component$<CardProps>((props) => {
  return (
    <div
      class={`bg-white rounded-lg shadow-md overflow-hidden ${props.class || ''}`}
    >
      {props.children}
    </div>
  );
});

export type InputProps = QwikIntrinsicElements['input'] & {
  class?: string;
};

export const Input = component$<InputProps>((props) => {
  return (
    <input
      {...props}
      class={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.class || ''}`}
    />
  );
});

export interface SelectProps {
  class?: string;
  children?: any;
  value?: string;
}

export const Select = component$<SelectProps>((props) => {
  const className = props.class || '';
  const children = props.children;
  const value = props.value;
  return (
    <select
      value={value}
      class={{
        [`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`]: true
      }}
    >
      {children}
    </select>
  );
});