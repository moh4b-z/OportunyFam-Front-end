import './HomePage.css'

function HomeC(){
    let pessoa = 1

    return(
        <div>
            {
                pessoa == 1 ? 
                    <p>pessoa existe</p> : 
                <p>pessoa não existe</p>
                
            }
        </div>
    )
}