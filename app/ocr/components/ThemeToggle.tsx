"use client";

export default function ThemeToggle() {
  function toggle() {
    const html = document.documentElement;
    const theme = html.classList.contains("dark") ? "light" : "dark";
    html.classList.remove("light", "dark");
    html.classList.add(theme);
  }

  return (
    <button
      onClick={toggle}
      className="px-4 py-2 bg-gray-700 text-white rounded"
    >
      Alternar tema
    </button>
  );
}
