import React from 'react'
import { User } from '../../assets/svg'

function Invoice() {
  return (<>
  <div className='container'>

    <div className="table-responsive table_outer_div  ">
        <table className="table table-borderless text-light">
            <thead>
                <tr>
                    <th scope="col">Invoice No.</th>
                    <th scope="col">Status</th>
                    <th scope="col">Due Date</th>
                    <th scope="col" >Comment</th>
                    <th scope="col" className='lastCell'>Contact Details <div className='IconBox'><User /></div></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row"><input type='checkbox' id='select_1' className='mx-2' /><span className="checkMark"></span> ONV001</th>
                    <td  className=''>
                      <button className="" > Paid</button>
                    </td>
                    <td className='dateCell'>Jan 1, 2023</td>
                    <td >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare in nibh vitae porttitor. Donec mattis velit vel nisi vehicula posuere.</td>
                    <td >First Name Last Name
                    Email@Example.com.au <div className='IconBox'><User /></div></td>
                    
                </tr>
            </tbody>
        </table>
    </div>
  </div>
  </>)
}

export default Invoice