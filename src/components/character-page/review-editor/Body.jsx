import { Loading, Snacks, Tab, TabPanel, Tabs } from '@yamada-ui/react';
import { Suspense, useState } from 'react';
import { EditorForm } from './EditorForm';
import { DraftPanel } from './DraftPanel';

export function Body({ drafts, setDrafts, snacks }) {
  const [index, onChange] = useState(0);
  return (
    <>
      <Tabs variant="rounded" index={index} onChange={onChange}>
        <Tab>Drafts</Tab>
        <Tab>Editor</Tab>

        <TabPanel>
          <Suspense fallback={<Loading />}>
            <DraftPanel
              drafts={drafts}
              setDrafts={setDrafts}
              changeTab={onChange}
            />
          </Suspense>
        </TabPanel>
        <TabPanel>
          <Suspense fallback={<Loading />}>
            <EditorForm />
          </Suspense>
        </TabPanel>
      </Tabs>

      <Snacks snacks={snacks} />
    </>
  );
}
