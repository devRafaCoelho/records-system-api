import handlebars from 'handlebars';
import fs from 'fs/promises';

export const compilerHtml = async (archive: string, context: any): Promise<string> => {
  const html: Buffer = await fs.readFile(archive);

  const compiler: any = handlebars.compile(html.toString());
  const htmlString: string = compiler(context);

  return htmlString;
};
