import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'For Candidates',
    links: ['Browse Jobs', 'Categories', 'My Applications'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Help Center', 'Privacy Policy', 'Terms of Service'],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
                J
              </span>
              <span className="text-lg font-bold text-slate-900">JobFinder</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              Connecting talented people with great companies.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold text-slate-800">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="cursor-pointer text-sm text-slate-500 hover:text-brand-600">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} JobFinder. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
