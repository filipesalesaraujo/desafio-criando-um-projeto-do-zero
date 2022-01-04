import { useEffect } from 'react';

export default function Comments(): JSX.Element {
  const appendSdkScript = (): void => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute('repo', 'schluters/desafio-01-cap-03-ignite');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'dark-blue');
    anchor.appendChild(script);
  };

  useEffect(() => {
    if (!document.querySelector('script#inject-comments-for-uterances')) {
      appendSdkScript();
    }
  }, []);

  return <div id="inject-comments-for-uterances" />;
}
