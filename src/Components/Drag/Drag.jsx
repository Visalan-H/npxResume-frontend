import React from 'react'
import './Drag.css'

export default function Drag({ text, position }) {
    return (
        <div className='main_drag'>
            <div className="meow">
                <h1>{text}</h1>
            </div>
            <div className="ani" style={{ top: position[1], left: position[0], visibility: `${(position[0] == 0 && position[1] == 0) ? 'hidden' : 'visible'}` }}></div>
        </div>
    )
}
