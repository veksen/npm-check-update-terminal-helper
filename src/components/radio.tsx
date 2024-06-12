interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  "data-testid": string
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}

export default function Radio(props: RadioProps) {
  return (
    <>
      <div className="inline-radio flex">
        <input
          className="peer order-2 cursor-pointer"
          data-testid={`radio-${props.id}`}
          id={props.id}
          type="radio"
          checked={props.checked}
          onChange={props.onChange}
        />
        <label
          className="order-1 cursor-pointer pr-2 peer-checked:text-[blue]"
          htmlFor={props.id}
        >
          {props.children}
        </label>
      </div>
    </>
  )
}
