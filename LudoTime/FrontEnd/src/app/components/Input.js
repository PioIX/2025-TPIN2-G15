export default function Input(props){
    return(
        <>
            <input className={props.classname} type={props.type} onChange={props.onChange} placeholder={props.placeholder}></input>
        </>
    )
}