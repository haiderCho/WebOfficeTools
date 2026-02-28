export const createSlashCommand = async () => {
  const { Extension } = await import("@tiptap/core")
  const Suggestion = (await import("@tiptap/suggestion")).default || (await import("@tiptap/suggestion")).Suggestion


  return Extension.create({
    name: "slashCommand",

    addOptions() {
      return {
        suggestion: {
          char: "/",
          command: ({ editor, range, props }: any) => {
            props.command({ editor, range })
          },
        },
      }
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
        }),
      ]
    },
  })
}
