/**
* Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
* Copyright (C) 2017-2021 THL A29 Limited, a Tencent company. All rights reserved.
* Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
* http://opensource.org/licenses/MIT
* Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import _ from 'lodash'
import store from '@/store'

const ANONYMOUS_USER = {
    id: null,
    isAuthenticated: false,
    username: 'anonymous',
    avatarUrl: null,
    chineseName: 'anonymous',
    phone: null,
    email: null
}

let currentUser = {
    avatar_url: '',
    bkpaas_user_id: '',
    chinese_name: '',
    username: ''
}

/**
 * 转换 user 对象，注意 camelCase
 *
 * @param {Object} data 待转换的对象
 *
 * @return {Object} 结果
 */
const transformUserData = (data) => {
    const user = {}
    Object.keys(data).forEach((key, index) => {
        const value = data[key]
        const camelCaseKey = _.camelCase(key)
        user[camelCaseKey] = value
    })
    return user
}

export default {
    /**
     * 未登录状态码
     */
    HTTP_STATUS_UNAUTHORIZED: 401,

    /**
     * 获取当前用户
     *
     * @return {Object} 当前用户信息
     */
    getCurrentUser () {
        return currentUser
    },

    /**
     * 跳转到登录页
     */
    redirectToLogin () {
        window.location.href = LOGIN_SERVICE_URL + '/?c_url=' + window.location.href
    },

    /**
     * 请求当前用户信息
     *
     * @return {Promise} promise 对象
     */
    requestCurrentUser () {
        let promise = null
        if (currentUser.bkpaas_user_id) {
            promise = new Promise((resolve, reject) => {
                const user = transformUserData(currentUser)
                if (user.code && user.code === 'Unauthorized') {
                    user.isAuthenticated = false
                } else {
                    user.isAuthenticated = true
                }
                resolve(user)
            })
        } else {
            if (!store.state.user || !Object.keys(store.state.user).length) {
                const req = store.dispatch('userInfo')
                promise = new Promise((resolve, reject) => {
                    req.then((resp) => {
                        const user = transformUserData(resp)
                        if (user.code && user.code === 'Unauthorized') {
                            user.isAuthenticated = false
                        } else {
                            user.isAuthenticated = true
                        }

                        // 存储当前用户信息(全局)
                        currentUser = store.getters.user
                        resolve(user)
                    }, (err) => {
                        if (err.response.status === this.HTTP_STATUS_UNAUTHORIZED || err.crossDomain) {
                            resolve({ ...ANONYMOUS_USER })
                        } else {
                            reject(err)
                        }
                    })
                })
            }
        }

        return promise
    }
}
