import "server-only";

export type LocalQuizLink = {
  id: string;
  topic: string;
  description: string;
  quizUrl: string;
};

type LocalQuizLinkRuntime = typeof globalThis & {
  __rees52LocalQuizLinks?: LocalQuizLink[];
};

function getStore() {
  const runtime = globalThis as LocalQuizLinkRuntime;
  runtime.__rees52LocalQuizLinks ??= [];
  return runtime.__rees52LocalQuizLinks;
}

export function getLocalQuizLinks() {
  return getStore().map((quizLink) => ({ ...quizLink }));
}

export function createLocalQuizLink(quizLink: LocalQuizLink) {
  getStore().unshift({ ...quizLink });
  return { ...quizLink };
}

export function updateLocalQuizLink(quizLink: LocalQuizLink) {
  const store = getStore();
  const index = store.findIndex((item) => item.id === quizLink.id);
  if (index === -1) return null;
  store[index] = { ...quizLink };
  return { ...quizLink };
}

export function deleteLocalQuizLink(id: string) {
  const store = getStore();
  const index = store.findIndex((item) => item.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}
