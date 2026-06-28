import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createJob, updateJob, fetchJobById, clearCurrent } from '../store/slices/jobSlice';
import { fetchMeta } from '../store/slices/metaSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

interface FormValues {
  title: string;
  company: string;
  description: string;
  category: string;
  experienceLevel: string;
  jobType: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  status: 'open' | 'closed';
  isFeatured: boolean;
}

const emptyForm: FormValues = {
  title: '',
  company: '',
  description: '',
  category: '',
  experienceLevel: '',
  jobType: '',
  location: '',
  salaryMin: '',
  salaryMax: '',
  status: 'open',
  isFeatured: false,
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function toOptions(values: string[]) {
  return values.map((v) => ({ label: v, value: v }));
}

export default function JobFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { current, mutateStatus, listStatus, error } = useAppSelector((state) => state.jobs);
  const meta = useAppSelector((state) => state.meta.meta);

  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!meta.categories.length) dispatch(fetchMeta());
  }, [dispatch, meta.categories.length]);

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchJobById(Number(id)));
    }
    return () => void dispatch(clearCurrent());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current) {
      setValues({
        title: current.title,
        company: current.company,
        description: current.description,
        category: current.category,
        experienceLevel: current.experienceLevel,
        jobType: current.jobType,
        location: current.location,
        salaryMin: current.salaryMin?.toString() ?? '',
        salaryMax: current.salaryMax?.toString() ?? '',
        status: current.status,
        isFeatured: current.isFeatured,
      });
    }
  }, [current, isEdit]);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (values.title.trim().length < 3) next.title = 'Title must be at least 3 characters';
    if (values.company.trim().length < 2) next.company = 'Company is required';
    if (values.description.trim().length < 20)
      next.description = 'Description must be at least 20 characters';
    if (!values.category) next.category = 'Select a category';
    if (!values.experienceLevel) next.experienceLevel = 'Select an experience level';
    if (!values.jobType) next.jobType = 'Select a job type';
    if (values.location.trim().length < 2) next.location = 'Location is required';

    const min = values.salaryMin ? Number(values.salaryMin) : null;
    const max = values.salaryMax ? Number(values.salaryMax) : null;
    if (values.salaryMin && (Number.isNaN(min!) || min! < 0))
      next.salaryMin = 'Enter a valid amount';
    if (values.salaryMax && (Number.isNaN(max!) || max! < 0))
      next.salaryMax = 'Enter a valid amount';
    if (min != null && max != null && max < min)
      next.salaryMax = 'Max salary must be greater than min salary';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: values.title.trim(),
      company: values.company.trim(),
      description: values.description.trim(),
      category: values.category,
      experienceLevel: values.experienceLevel,
      jobType: values.jobType,
      location: values.location.trim(),
      salaryMin: values.salaryMin ? Number(values.salaryMin) : null,
      salaryMax: values.salaryMax ? Number(values.salaryMax) : null,
      status: values.status,
      isFeatured: values.isFeatured,
    };

    const action =
      isEdit && id
        ? await dispatch(updateJob({ id: Number(id), payload }))
        : await dispatch(createJob(payload));

    if (!('error' in action)) {
      navigate('/jobs');
    }
  };

  if (isEdit && listStatus === 'loading' && !current) return <Spinner label="Loading job…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Job' : 'Post a Job'}</h1>
        <p className="text-sm text-slate-500">
          {isEdit ? 'Update the details of this posting' : 'Fill in the details to publish a new role'}
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Job title"
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
            error={errors.title}
          />
          <Input
            label="Company"
            value={values.company}
            onChange={(e) => setField('company', e.target.value)}
            error={errors.company}
          />
        </div>

        <Textarea
          label="Description"
          rows={6}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          error={errors.description}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Category"
            placeholder="Select category"
            options={toOptions(meta.categories)}
            value={values.category}
            onChange={(e) => setField('category', e.target.value)}
            error={errors.category}
          />
          <Select
            label="Experience level"
            placeholder="Select level"
            options={toOptions(meta.experienceLevels)}
            value={values.experienceLevel}
            onChange={(e) => setField('experienceLevel', e.target.value)}
            error={errors.experienceLevel}
          />
          <Select
            label="Job type"
            placeholder="Select type"
            options={toOptions(meta.jobTypes)}
            value={values.jobType}
            onChange={(e) => setField('jobType', e.target.value)}
            error={errors.jobType}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Location"
            value={values.location}
            onChange={(e) => setField('location', e.target.value)}
            error={errors.location}
          />
          <Input
            label="Min salary (₹/yr)"
            type="number"
            value={values.salaryMin}
            onChange={(e) => setField('salaryMin', e.target.value)}
            error={errors.salaryMin}
          />
          <Input
            label="Max salary (₹/yr)"
            type="number"
            value={values.salaryMax}
            onChange={(e) => setField('salaryMax', e.target.value)}
            error={errors.salaryMax}
          />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Select
            label="Status"
            options={[
              { label: 'Open', value: 'open' },
              { label: 'Closed', value: 'closed' },
            ]}
            value={values.status}
            onChange={(e) => setField('status', e.target.value as 'open' | 'closed')}
            className="w-40"
          />
          <label className="mt-6 inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(e) => setField('isFeatured', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Feature this job on the landing page
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="secondary" onClick={() => navigate('/jobs')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutateStatus === 'loading'}>
            {isEdit ? 'Save changes' : 'Publish job'}
          </Button>
        </div>
      </form>
    </div>
  );
}
