import React, { Suspense, lazy, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DeckShell } from '@kit/components/DeckShell';
import { findModule } from '../modules/registry';
import { NotFoundPage } from './NotFoundPage';

const Loading: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED] font-sans">
    <div className="text-center space-y-2">
      <div className="w-8 h-8 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs text-[#767676] font-mono">Loading {title}…</p>
    </div>
  </div>
);

/**
 * Resolves `/:course/:moduleId` against the registry and hands the loaded
 * module to the shell. Each module is a separate lazy chunk, so the site stays
 * fast no matter how many units get added.
 */
export const ModulePage: React.FC = () => {
  const { course, moduleId } = useParams();
  const meta = course && moduleId ? findModule(course, moduleId) : undefined;

  const LazyDeck = useMemo(() => {
    if (!meta) return null;
    return lazy(async () => {
      const loaded = await meta.load();
      return {
        default: () => (
          <DeckShell moduleTitle={meta.title} badge={meta.id} module={loaded.default} />
        ),
      };
    });
  }, [meta]);

  if (!meta || !LazyDeck) {
    return (
      <NotFoundPage
        message={`No interactive module registered as ${course}/${moduleId}.`}
      />
    );
  }

  return (
    <Suspense fallback={<Loading title={meta.title} />}>
      <LazyDeck />
    </Suspense>
  );
};
