declare module '@heroicons/react/24/outline';
declare module '@tinymce/tinymce-react' {
  import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
  export interface EditorProps {
    apiKey?: string;
    value?: string;
    onEditorChange?: (content: string, editor: any) => void;
    init?: Record<string, any>;
    [key: string]: any;
  }
  export const Editor: React.FC<EditorProps>;
}
declare module 'flowbite-react';
declare module '@stripe/react-stripe-js';
declare module '@stripe/stripe-js'; 