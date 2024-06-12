import cx from "clsx"

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  reverse?: boolean
  "data-testid": string
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}

export default function Radio(props: RadioProps) {
  return (
    <>
      <div
        className={cx("inline-radio flex gap-2", {
          "flex-row-reverse": Boolean(props.reverse),
        })}
      >
        <input
          className="peer cursor-pointer"
          data-testid={`radio-${props.id}`}
          id={props.id}
          type="radio"
          checked={props.checked}
          onChange={props.onChange}
        />
        <label
          className="cursor-pointer peer-checked:text-[blue]"
          htmlFor={props.id}
        >
          {props.children}
        </label>
      </div>
    </>
  )
}
