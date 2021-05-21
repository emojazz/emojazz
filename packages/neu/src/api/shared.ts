import yaml from 'js-yaml'
import S from 'jsonschema-definer'

declare global {
  interface Window {
    goLoadSearch: () => Promise<{
      result: string
    }>
    goLoadImage: () => Promise<{
      result: string
      base?: string
    }>

    NL_PATH: string
    NL_CWD: string
    NL_OS: 'Windows' | 'Linux' | 'macOS'
    NL_BASE_URL: string

    Neutralino: {
      filesystem: {
        readFile(inp: { fileName: string }): Promise<{
          data: string
        }>
      }
    }
  }
  interface ImportMeta {
    env: {
      __LoadSearch__: string
      __LoadImage__: string
      __BaseURL__: string
    }
  }
}

window.goLoadSearch = async () => {
  if (window.NL_OS) {
    if (!window.Neutralino) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return window.goLoadSearch()
    }

    return window.Neutralino.filesystem
      .readFile({
        fileName: [window.NL_PATH, 'assets', 'search.yaml'].join(
          window.NL_OS === 'Windows' ? '\\' : '/',
        ),
      })
      .then((r) => ({
        result: r.data,
      }))
  }

  return {
    result: import.meta.env.__LoadSearch__,
  }
}
window.goLoadImage = async () => {
  if (window.NL_OS) {
    if (!window.Neutralino) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return window.goLoadImage()
    }

    return window.Neutralino.filesystem
      .readFile({
        fileName: [window.NL_PATH, 'assets', 'image.yaml'].join(
          window.NL_OS === 'Windows' ? '\\' : '/',
        ),
      })
      .then((r) => ({
        result: r.data,
      }))
  }

  return {
    result: import.meta.env.__LoadImage__,
  }
}

export const tSearch = {
  unicode: S.list(S.string()),
  categories: S.list(S.string()),
  description: S.object().additionalProperties(S.string()),
  tag: S.list(S.string()),
}

export const sSearch = S.shape(tSearch)

let searchObject: Record<string, typeof sSearch.type>

export async function getSearchObject(): Promise<typeof searchObject> {
  searchObject =
    searchObject ||
    S.object()
      .additionalProperties(sSearch)
      .ensure(
        yaml.load(await window.goLoadSearch().then((r) => r.result)) as any,
      )

  return searchObject
}
