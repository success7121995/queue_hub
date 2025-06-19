# ModalForm Component

A flexible and reusable modal form component that supports various input types including text, textarea, image uploads, time pickers, and structured address fields.

## Features

- **Multiple Input Types**: Text, textarea, email, tel, image upload, time picker, and structured address
- **Form Validation**: Built-in required field validation and custom validation functions
- **Image Upload Integration**: Seamless integration with the existing ImageUploader component
- **Time Picker Integration**: Integration with the existing TimePicker component
- **Responsive Design**: Mobile-friendly modal with proper backdrop and keyboard navigation
- **Accessibility**: Proper ARIA labels, keyboard navigation (Escape to close), and focus management
- **Click Outside to Close**: Users can dismiss the modal by clicking outside or pressing Escape
- **Customizable**: Configurable titles, button text, and field configurations

## Usage

### Basic Example

```tsx
import { ModalForm } from "@/components";
import type { ModalFormField } from "@/components/common/modal-form";

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const fields: ModalFormField[] = [
    {
      id: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your name'
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Enter your email'
    }
  ];

  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form data:', data);
    // Handle form submission
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Form</button>
      
      <ModalForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="User Information"
        fields={fields}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
```

### Field Types

#### Text Input
```tsx
{
  id: 'name',
  label: 'Name',
  type: 'text',
  required: true,
  placeholder: 'Enter name',
  validation: (value) => {
    if (value && value.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }
}
```

#### Textarea
```tsx
{
  id: 'description',
  label: 'Description',
  type: 'textarea',
  placeholder: 'Enter description...',
  required: false
}
```

#### Image Upload
```tsx
{
  id: 'logo',
  label: 'Company Logo',
  type: 'image',
  required: true,
  imageConfig: {
    frameWidth: 200,
    frameHeight: 200,
    multiple: false,
    fontSize: 14
  }
}
```

#### Time Picker
```tsx
{
  id: 'startTime',
  label: 'Start Time',
  type: 'time',
  required: true,
  timeConfig: {
    format: 'HH:mm',
    disabled: false
  }
}
```

#### Address (Structured)
```tsx
{
  id: 'address',
  label: 'Full Address',
  type: 'address',
  required: true
}
```

### Props

#### ModalFormProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | - | Controls modal visibility |
| `onClose` | `() => void` | Yes | - | Callback when modal is closed |
| `title` | `string` | Yes | - | Modal title |
| `fields` | `ModalFormField[]` | Yes | - | Array of form fields |
| `onSubmit` | `(data: Record<string, any>) => void` | Yes | - | Callback when form is submitted |
| `submitText` | `string` | No | "Save" | Submit button text |
| `cancelText` | `string` | No | "Cancel" | Cancel button text |
| `initialData` | `Record<string, any>` | No | `{}` | Initial form data |

#### ModalFormField

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique field identifier |
| `label` | `string` | Yes | Field label |
| `type` | `'text' \| 'textarea' \| 'image' \| 'time' \| 'email' \| 'tel' \| 'address'` | Yes | Field type |
| `value` | `any` | No | Initial field value |
| `required` | `boolean` | No | Whether field is required |
| `placeholder` | `string` | No | Field placeholder text |
| `validation` | `(value: any) => string \| null` | No | Custom validation function |
| `imageConfig` | `ImageConfig` | No | Configuration for image fields |
| `timeConfig` | `TimeConfig` | No | Configuration for time fields |

#### ImageConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `frameWidth` | `number` | 240 | Image uploader width |
| `frameHeight` | `number` | 160 | Image uploader height |
| `multiple` | `boolean` | false | Allow multiple image uploads |
| `fontSize` | `number` | 12 | Font size for uploader text |

#### TimeConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `format` | `string` | 'HH:mm' | Time format (HH:mm or HH:mm:ss) |
| `disabled` | `boolean` | false | Whether time picker is disabled |

## Integration with Branch Detail

The ModalForm is already integrated into the BranchDetail component for editing various branch properties:

- **Address**: Edit street, city, state, and country
- **Logo**: Upload branch logo
- **Feature Image**: Upload feature image
- **Description**: Edit branch description
- **Contact**: Edit contact person information

### Example from Branch Detail

```tsx
// Modal form configurations
const getModalFields = (modalType: string): ModalFormField[] => {
  switch (modalType) {
    case 'address':
      return [
        {
          id: 'street',
          label: 'Street Address',
          type: 'text',
          required: true,
          placeholder: 'Enter street address',
          value: branch.Address?.street || ''
        },
        // ... more address fields
      ];
    // ... other modal types
  }
};

// Usage in component
<ModalForm
  isOpen={!!editModal}
  onClose={handleModalClose}
  title={editModal ? getModalTitle(editModal) : ''}
  fields={editModal ? getModalFields(editModal) : []}
  onSubmit={handleModalSubmit}
  submitText="Save Changes"
  cancelText="Cancel"
/>
```

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- **Colors**: Uses `primary-light` for primary actions and focus states
- **Spacing**: Consistent padding and margins
- **Typography**: Follows the existing font hierarchy
- **Responsive**: Mobile-first design with proper breakpoints

## Accessibility

- **Keyboard Navigation**: Escape key closes the modal
- **Focus Management**: Proper focus trapping within the modal
- **ARIA Labels**: Appropriate ARIA attributes for screen readers
- **Click Outside**: Clicking outside the modal closes it
- **Form Labels**: Proper label associations for form fields

## Dependencies

- `react-hook-form` (for form state management)
- `lucide-react` (for icons)
- `ImageUploader` component
- `TimePicker` component

## Example Component

See `modal-form-example.tsx` for a comprehensive example showing all field types and configurations. 