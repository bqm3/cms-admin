## Technologies Used

- [Vite](https://vitejs.dev/guide/)
- [HeroUI](https://heroui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)

1. **Install Dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Start the Dev Server:**
   ```bash
   npm run dev
   ```

3. **Open in Browser:**
   Check your terminal for the localhost URL (usually http://localhost:5173) and open it up!

## Dynamic JSON Rendering Feature

I've integrated a feature where you can render dynamic data directly into your components. There's a `dummyJson` file already saved in the application context which acts as the data source.

**How to use it:**

1. Drag and drop a **Heading** or **Text** component onto the editor canvas.
2. Click on the text to enter edit mode.
3. Type your data keys inside double curly brackets. For example: `{{customer.name}}` or `{{items[0].name}}`.
4. Click away (deselect), and watch it instantly fetch the value from the JSON and render it!

It supports nested objects and even array indexing. Try it out with the sample data keys like `orderId`, `customer.name`, or `payment.status`.
