import { getCollection, type CollectionEntry } from 'astro:content';

export type Essay = CollectionEntry<'essays'>;

export interface EssayYearGroup {
  year: string;
  essays: Essay[];
}

/** 已发布随笔：排除草稿，按日期倒序；同日期以标题稳定排序。 */
export async function getPublishedEssays(): Promise<Essay[]> {
  const essays = await getCollection('essays', ({ data }) => data.draft !== true);

  return essays.slice().sort((a, b) => {
    const byDate = b.data.date.valueOf() - a.data.date.valueOf();
    if (byDate !== 0) return byDate;
    return a.data.title.localeCompare(b.data.title, 'zh-CN');
  });
}

/** 按年份分组：年份倒序，年内保持日期倒序。 */
export async function groupByYear(): Promise<EssayYearGroup[]> {
  const groups = new Map<string, Essay[]>();

  for (const essay of await getPublishedEssays()) {
    const year = String(essay.data.date.getFullYear());
    const bucket = groups.get(year);
    if (bucket) {
      bucket.push(essay);
    } else {
      groups.set(year, [essay]);
    }
  }

  return [...groups.entries()].map(([year, essays]) => ({ year, essays }));
}

/** 归档行使用的日期格式：2026.11.20 */
export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}
