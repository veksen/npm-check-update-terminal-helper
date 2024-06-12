interface OptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
  "data-testid": string
  value: string
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}

export default function Option(props: OptionProps) {
  return (
    <label
      data-testid={props["data-testid"]}
      className="flex cursor-pointer items-center gap-1"
    >
      <input
        data-testid={`${props["data-testid"]}-checkbox`}
        type="checkbox"
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
      />
      <span>{props.children}</span>
    </label>
  )
}
