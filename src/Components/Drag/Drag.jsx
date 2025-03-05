import React from 'react'
import './Drag.css'

export default function Drag({text}) {
    return (
        <div className='main_drag'>
            <div className="meow">
                <h1>{text}</h1>
            </div>
        </div>
    )
}
