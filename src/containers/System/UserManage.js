import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './UserManage.scss'
import {handleGetAllUsers, createNewUsersServices, deleteUsersServices, editUsersServices} from '../../services/userServices';
import ModalUser from './ModalUser';
import ModalEditUser from './ModalEditUser';
class UserManage extends Component {
    constructor(props){
        super(props);
        this.state = {
            arrUsers: [],
            isOpenModalUser: false,
            isOpenModalEditUser: false,
            userEdit: {}
        }
    }

    async componentDidMount() {
        await this.getAllUsers();
    }
    getAllUsers = async() =>{
        let response = await handleGetAllUsers('ALL');
        if(response && response.errCode === 0){
            this.setState({
                arrUsers: response.users
            })
        }
        // console.log(this.state.arrUsers)
    }
    handleAddNewUsers = () => {
        this.setState({
            isOpenModalUser: true
        }
        )
    }
    toogleUserModal = () => {
        this.setState({
            isOpenModalUser: ! this.state.isOpenModalUser,
            
        })
    }
    toogleEditUserModal = () => {
        this.setState({
        
            isOpenModalEditUser: ! this.state.isOpenModalEditUser,
            
        })
    }
    createNewUsers = async(data) => {
        
       
        try {
            let response = await createNewUsersServices(data);
           
            if(response && response.errCode !==0){
                alert(response.errMessage)
               
            }else{
                await this.getAllUsers();
                this.setState({
                    isOpenModalUser: false
                })
            }
           
        } catch (error) {
            console.log(error)
        }
    }
    handleDeleteUsers = async(item) => {
        try {
            let response = await deleteUsersServices(item.id);
            console.log(response.errMessage)
            if(response && response.errCode === 0){
                await this.getAllUsers();
            }else{
                alert(response.errMessage)
            }
        } catch (error) {
            console.log(error);
        }
    }
    handleEditUsers = (users) => {
        this.setState({
            isOpenModalEditUser: true,
            userEdit: users
        }
        )
    }
   editUsers = async(item) => {
        try {
            let response = await editUsersServices(item);
            if(response && response.errCode === 0){
                await this.getAllUsers();
            }else{
                alert(response.errMessage)
            }
        } catch (error) {
            console.log(error)
        }
    }

    render() {
        let arrUsers = this.state.arrUsers;
        return (
            <div>
                <ModalUser
                isOpenModalUser={this.state.isOpenModalUser}
                createNewUsers={this.createNewUsers}
                toogleFromParent = {this.toogleUserModal}
                />
                {
                    this.state.isOpenModalEditUser && 
                    <ModalEditUser 
                    isOpenModalEditUser={this.state.isOpenModalEditUser}
                    toogleFromParent={()=>{this.toogleEditUserModal()}}
                    currentUser = {this.state.userEdit}
                    editUsers = {this.editUsers}
                    />
                    
                }
                <button
                 className='btn btn-success mt-3 mx-4 px-3'
                 onClick={() => this.handleAddNewUsers()}
                 >Thêm người dùng</button>
                <table id="customers">
                    <tbody>
                        <tr>
                        <th>Email</th>
                        <th>Họ</th>
                        <th>Tên</th>
                        <th>Địa chỉ</th>
                        <th>Số điện thoại</th>
                        <th>Giới tính</th>
                        <th>Vị trí</th>
                        <th>Thao tác</th>
                            
                    </tr>
                    
                    {arrUsers && arrUsers.map((item, index) =>{
                        return(
                            <tr  key={index}>
                                <td>{item.email}</td>
                                <td>{item.firstName}</td>
                                <td>{item.lastName}</td>
                                <td>{item.address}</td>
                                <td>{item.phoneNumber}</td>
                                <td>{item.gender}</td>
                                <td>{item.positionId}</td>
                                <td>
                                    <a  type="button" className="btn btn-primary mx-3 px-3"  onClick={()=>{this.handleEditUsers(item)}}>Sửa</a>
                                    <a type="button" className="btn btn-danger px-3" onClick={()=>{this.handleDeleteUsers(item)}}>Xóa</a>      
                                </td>
                            </tr>    
                        )
                    })
                    }
                    </tbody>
                
                    
                
            </table>
            </div>
            
         
        );
    }

}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserManage);
