import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import {
  formatFiles,
  runTasksInSerial,
} from '@nx/devkit';
import componentGenerator from '../component/generator.js';
import pageGenerator from '../page/generator.js';
import type { ComponentGeneratorSchema } from '../component/generator.js';
import type { PageGeneratorSchema } from '../page/generator.js';

export interface AstroFileGeneratorSchema {
  kind: 'page' | 'component';
  name: string;
  project: string;
  directory?: string;
  ext?: 'astro' | 'md' | 'adoc' | 'mdx' | 'mdoc';
  props?: string;
  bulk?: boolean;
  projects?: string[];
  skipFormat?: boolean;
}

export default async function (tree: Tree, options: AstroFileGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  
  // Validate options first
  validateOptions(options);
  
  if (options.bulk && options.projects) {
    // Bulk mode: iterate through selected projects
    for (const projectName of options.projects) {
      const projectOptions = {
        ...options,
        project: projectName,
        bulk: false, // Prevent infinite recursion
        projects: undefined,
      };
      
      const task = await delegateToGenerator(tree, projectOptions);
      if (task) {
        tasks.push(task);
      }
    }
  } else {
    // Single project mode
    const task = await delegateToGenerator(tree, options);
    if (task) {
      tasks.push(task);
    }
  }
  
  // Format files at the end if not skipped
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  
  return runTasksInSerial(...tasks);
}

function validateOptions(options: AstroFileGeneratorSchema): void {
  // Validate required fields
  if (!options.kind) {
    throw new Error('kind is required');
  }
  if (!options.name) {
    throw new Error('name is required');
  }
  if (!options.project && !options.bulk) {
    throw new Error('project is required when not in bulk mode');
  }
  
  // Validate bulk mode requirements
  if (options.bulk && (!options.projects || options.projects.length === 0)) {
    throw new Error('projects array is required when bulk=true');
  }
  
  // Validate kind-specific requirements
  if (options.kind === 'component' && options.props) {
    // Props are only valid for components, this is fine
  }
  if (options.kind === 'page' && options.props) {
    console.warn('Warning: props parameter is ignored for pages');
  }
}

async function delegateToGenerator(tree: Tree, options: AstroFileGeneratorSchema): Promise<GeneratorCallback | null> {
  if (options.kind === 'component') {
    const componentOptions: ComponentGeneratorSchema = {
      name: options.name,
      project: options.project!,
      directory: options.directory,
      props: options.props,
      ext: options.ext as 'astro' | 'mdx' | undefined,
      skipFormat: true, // We'll format at the end
    };
    
    return await componentGenerator(tree, componentOptions);
  } else if (options.kind === 'page') {
    const pageOptions: PageGeneratorSchema = {
      name: options.name,
      project: options.project!,
      directory: options.directory,
      ext: options.ext,
      skipFormat: true, // We'll format at the end
    };
    
    return await pageGenerator(tree, pageOptions);
  }
  
  return null;
}
