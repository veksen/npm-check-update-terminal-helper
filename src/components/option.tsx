import cx from "clsx"

interface OptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
  "data-testid": string
  value: string
  checked: boolean
  onChange: () => void
  children: React.ReactNode
  disabled?: boolean
}

export default function Option(props: OptionProps) {
  return (
    <label
      data-testid={props["data-testid"]}
      className={cx("flex cursor-pointer items-center gap-1", {
        "pointer-events-none cursor-not-allowed opacity-40": Boolean(
          props.disabled
        ),
      })}
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
