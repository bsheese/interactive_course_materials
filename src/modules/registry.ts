import type { CourseMeta, ModuleMeta } from '@kit/types';

/**
 * The index of everything this site publishes.
 *
 * Adding a module = one entry here + a folder under `src/modules/<course>/`.
 * `load` must be a literal dynamic import so Vite can code-split it; the
 * module's code is only fetched when a student opens its route.
 */

export const COURSES: CourseMeta[] = [
  {
    id: '225',
    title: 'cs225',
    subtitle: 'Data Wrangling & Visualization',
    repoUrl: 'https://github.com/bsheese/cs225',
  },
  {
    id: '377',
    title: 'cs377',
    subtitle: 'Machine Learning',
    repoUrl: 'https://github.com/bsheese/cs377',
  },
  {
    id: '387',
    title: 'cs387',
    subtitle: 'Deep Learning',
    repoUrl: 'https://github.com/bsheese/cs387',
  },
];

export const MODULES: ModuleMeta[] = [
  {
    course: '377',
    id: '17_0',
    title: 'Statistical Foundations',
    description:
      'Prediction from the mean, deviations, TSS, variance, standard deviation, covariance, Pearson’s r, residuals and R² — built by hand, one visual at a time.',
    status: 'published',
    sourceUnit: '17_regression_crossval/17_0_Preliminaries',
    notebookUrl:
      'https://github.com/bsheese/cs377/tree/main/17_regression_crossval/17_0_Preliminaries',
    load: () => import('./377/17_0/index'),
  },
  {
    course: '377',
    id: '17_1',
    title: 'Simple Linear Regression',
    description:
      'The whole SLR arc: fitting in two libraries, significance built from shuffles and resamples, the LINE assumptions, influence and Cook’s distance, log transformations, and the generalization test.',
    status: 'published',
    sourceUnit: '17_regression_crossval/17_1_SLR',
    notebookUrl: 'https://github.com/bsheese/cs377/tree/main/17_regression_crossval/17_1_SLR',
    load: () => import('./377/17_1/index'),
  },
];

export const courseById = (id: string): CourseMeta | undefined =>
  COURSES.find((c) => c.id === id);

export const findModule = (course: string, id: string): ModuleMeta | undefined =>
  MODULES.find((m) => m.course === course && m.id === id);

/** Visible modules for a course, in registry order. */
export const modulesForCourse = (course: string): ModuleMeta[] =>
  MODULES.filter((m) => m.course === course && m.status !== 'hidden');

/** Courses that actually have something to show, in registry order. */
export const populatedCourses = (): CourseMeta[] =>
  COURSES.filter((c) => modulesForCourse(c.id).length > 0);
