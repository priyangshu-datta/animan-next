import { Snacks, Tab, TabPanel, Tabs } from '@yamada-ui/react';
import { useState } from 'react';
import { DraftPanel } from './DraftPanel';
import { EditorForm } from './EditorForm';

export function Body({ drafts, setDrafts, snacks }) {
  const [index, onChange] = useState(0);
  return (
    <>
      <Tabs variant="sticky-subtle" index={index} onChange={onChange}>
        <Tab>Drafts</Tab>
        <Tab>Editor</Tab>

        <TabPanel>
          <DraftPanel
            drafts={drafts}
            setDrafts={setDrafts}
            changeTab={onChange}
          />
        </TabPanel>
        <TabPanel px="0"><EditorForm /></TabPanel>
      </Tabs>

      <Snacks snacks={snacks} />
    </>
  );
}
