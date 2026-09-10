import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Github, Sparkles } from 'lucide-react';
import { COURSES, courseById, modulesForCourse, populatedCourses } from '../modules/registry';

/**
 * The index students land on. With a `:course` param it narrows to one course;
 * without, it lists every course that has published modules.
 */
export const HomePage: React.FC = () => {
  const { course: courseParam } = useParams();
  const selected = courseParam ? courseById(courseParam) : undefined;
  const courses = selected ? [selected] : populatedCourses();
  const unknownCourse = Boolean(courseParam && !selected);

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans">
      <header className="bg-[#ECE8E1] border-b border-[#1A1A1A]/10 px-5 py-8">
        <div className="max-w-5xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#E67E22]">
            Interactive Companions
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1">
            Course Modules You Can Play With
          </h1>
          <p className="text-sm text-[#555555] mt-2 max-w-2xl leading-relaxed">
            Visual sandboxes that pair with the notebooks — drag the data, move the line, watch
            the arithmetic follow. Each page covers one unit and is meant to be opened alongside
            it, in lecture or on your own.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10 space-y-12">
        {unknownCourse && (
          <p className="text-sm text-[#C0392B]">
            No course numbered "{courseParam}" — showing everything instead.{' '}
            <Link to="/" className="underline">
              Back to the index
            </Link>
            .
          </p>
        )}

        {(unknownCourse ? populatedCourses() : courses).map((course) => {
          const modules = modulesForCourse(course.id);
          if (modules.length === 0) return null;

          return (
            <section key={course.id} className="space-y-4">
              <div className="flex items-end justify-between gap-4 border-b border-[#1A1A1A]/10 pb-2">
                <div>
                  <h2 className="text-lg font-serif font-bold tracking-tight">
                    {course.title}{' '}
                    <span className="text-[#767676] font-normal">— {course.subtitle}</span>
                  </h2>
                </div>
                {course.repoUrl && (
                  <a
                    href={course.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#4A4A4A] hover:text-[#1A1A1A] flex items-center gap-1.5 shrink-0"
                  >
                    <Github className="w-3.5 h-3.5" />
                    course repo
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <Link
                    key={`${module.course}/${module.id}`}
                    to={`/${module.course}/${module.id}`}
                    className="group bg-white border border-[#1A1A1A]/10 rounded-sm p-5 shadow-xs hover:border-[#E67E22] hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[10px] font-bold text-[#1A1A1A] bg-[#ECE8E1] px-2 py-0.5 rounded-sm border border-[#1A1A1A]/10">
                          {module.id}
                        </span>
                        {module.status === 'draft' && (
                          <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#B9770E] bg-[#F4D03F]/20 px-2 py-0.5 rounded-sm border border-[#B9770E]/30">
                            Draft
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-base leading-snug group-hover:text-[#E67E22] transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-xs text-[#555555] mt-2 leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[11px]">
                      {module.sourceUnit ? (
                        <span className="text-[#767676] font-mono truncate" title={module.sourceUnit}>
                          {module.sourceUnit}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[#E67E22] font-bold flex items-center gap-1 shrink-0">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {populatedCourses().length === 0 && (
          <p className="text-sm text-[#555555] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E67E22]" />
            No modules registered yet — add one in <code className="font-mono">src/modules/registry.ts</code>.
          </p>
        )}

        <section className="pt-4 border-t border-[#1A1A1A]/10">
          <p className="text-xs text-[#767676] flex items-start gap-2 leading-relaxed">
            <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#E67E22]" />
            <span>
              Courses covered: {COURSES.map((c) => c.title).join(', ')}. Modules are added as
              they're built; see <code className="font-mono">CONTRIBUTING.md</code> in the repo for
              how to add one.
            </span>
          </p>
        </section>
      </main>
    </div>
  );
};
