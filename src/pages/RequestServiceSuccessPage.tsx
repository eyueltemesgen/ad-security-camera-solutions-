import { Link, useSearchParams } from 'react-router-dom';

export default function RequestServiceSuccessPage() {
  const [params] = useSearchParams();
  const ref = params.get('ref');

  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h1 className="mt-5 text-2xl font-bold">Service Request Submitted</h1>
        {ref && (
          <p className="mt-2 text-sm text-slate-500">
            Your reference number is <span className="font-bold text-slate-800">{ref}</span>. Our team will contact you shortly.
          </p>
        )}
        <p className="mt-2 text-sm text-slate-500">
          Want to track the progress of your request? Create an account and it will appear in your dashboard.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn btn-primary">Create Account</Link>
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}