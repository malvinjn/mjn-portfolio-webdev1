import type { Project } from "@/src/types/project";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const hasCustomImage =
    Boolean(project.image_url?.trim()) &&
    project.image_url !== "/project-placeholder.svg";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {hasCustomImage ? (
          <img
            src={project.image_url!}
            alt={`Tampilan proyek ${project.title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={`Ilustrasi proyek ${project.title}`}
            className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-slate-900 p-6 text-center text-white"
          >
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur">
              {project.category}
            </span>
            <p className="mt-3 line-clamp-2 text-lg font-bold">{project.title}</p>
          </div>
        )}

        {project.featured && (
          <span className="absolute top-3 right-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
            {project.category}
          </span>
        </div>

        <h3 className="mt-2 text-xl font-bold text-slate-950">{project.title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-700">{project.summary}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
          {project.description}
        </p>

        {project.skills && project.skills.length > 0 && (
          <ul
            aria-label={`Teknologi pada ${project.title}`}
            className="mt-4 flex flex-wrap gap-1.5"
          >
            {project.skills.map((skill) => (
              <li
                key={skill.id || skill.name}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {skill.name}
              </li>
            ))}
          </ul>
        )}

        {project.repo_url && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Lihat Repository / Demo →
            </a>
          </div>
        )}
      </div>
    </article>
  );
}