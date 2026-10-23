import React, {type ComponentProps, type ReactNode} from 'react';
import OriginalAdmonition from '@theme-original/Admonition';
import {translate} from '@docusaurus/Translate';

// Directive syntax is protected in the Weblate Markdown mirror. Register its
// visible custom captions as normal UI messages instead of hiding that text.
function localizedTitle(title: string): string {
  switch (title) {
    case 'FAQ':
      return translate({id: 'docs.admonition.faq', message: 'FAQ', description: 'Custom title of documentation FAQ callouts'});
    case 'Example':
      return translate({id: 'docs.admonition.example', message: 'Example', description: 'Custom title of documentation example callouts'});
    case 'Important':
      return translate({id: 'docs.admonition.important', message: 'Important', description: 'Custom title of important documentation callouts'});
    case 'Errata':
      return translate({id: 'docs.admonition.errata', message: 'Errata', description: 'Custom title of documentation corrections'});
    case 'Expert Difficulty':
      return translate({id: 'docs.admonition.expertDifficulty', message: 'Expert Difficulty', description: 'Custom title of the Expert difficulty rule callout'});
    default:
      return title;
  }
}

export default function Admonition(props: ComponentProps<typeof OriginalAdmonition>): ReactNode {
  // Keep an absent title absent so the original component can supply its
  // localized default title and handle rich MDX titles as usual.
  return typeof props.title === 'string'
    ? <OriginalAdmonition {...props} title={localizedTitle(props.title)} />
    : <OriginalAdmonition {...props} />;
}
