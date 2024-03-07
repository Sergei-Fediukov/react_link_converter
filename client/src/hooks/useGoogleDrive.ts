import { useCallback, useContext, useEffect } from 'react'

import { useGoogleLogin } from '@react-oauth/google'
import { useLocation } from 'react-router-dom'

import { get, post } from 'src/api'
import { ConvertedDataContext } from 'src/context/convertedDataContext.ts/ConvertedDataContext'
import { GoogleApiContext } from 'src/context/googleApiContext/GoogleApiContext'

export const useGoogleDrive = () => {
  const { setAuthResponse, folderList, setFolderList, loginError, setLoginError, isLoggingIn, setIsLoggingIn, setIsUserDriveFileUpolad } = useContext(GoogleApiContext)
  const { convertDataOptions } = useContext(ConvertedDataContext)

  const getUserDriveFolderList = async (accessToken: string) => {
    const url = 'https://www.googleapis.com/drive/v3/files'
    const params = {
      q: "mimeType = 'application/vnd.google-apps.folder' and 'me' in owners",
      fields: 'files(id, name, parents)',
      spaces: 'drive'
    }
    const queryString = new URLSearchParams(params).toString()
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
    try {
      return await get(`${url}?${queryString}`, options)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  function buildFolderStructure(data: any) {
    const folders: any = {}
    data.map((item: any) => {
      const { id, name, parents } = item
      if (!folders[id]) {
        folders[id] = { id, name, parents, subFolders: [] }
      } else {
        folders[id].name = name
        folders[id].parents = parents
      }
      return {}
    })

    Object.keys(folders).forEach((folderId) => {
      const folder = folders[folderId]
      const parentId = folder.parents && folder.parents[0]
      if (folders[parentId]) {
        folders[parentId].subFolders.push(folder)
        delete folders[folderId]
      }
    })

    return folders
  }

  const loginAndGerDriveFolders = useGoogleLogin({
    onSuccess: async (authResponse) => {
      setAuthResponse(authResponse)
      if (authResponse?.access_token) {
        const folderList = await getUserDriveFolderList(authResponse.access_token)
        setFolderList(buildFolderStructure(folderList.files))
      }
      setIsLoggingIn(false)
    },
    onError: (error) => {
      setLoginError(error)
      setIsLoggingIn(false)
    },
    prompt: 'select_account',
    flow: 'implicit',
    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file'
  })

  const getGoogleDriveFolderList = useCallback(() => {
    setIsLoggingIn(true)
    loginAndGerDriveFolders()
  }, [loginAndGerDriveFolders, setIsLoggingIn])

  useEffect(() => {
    if (isLoggingIn && !folderList && loginError) {
      console.error('Login Failed:', loginError)
    }
  }, [isLoggingIn, folderList, loginError])

  const { pathname } = useLocation()
  const userDriveFileUpolad = async (accessToken: string, { fileName, resourceName, resourceUrl }: any, folderId?: string) => {
    setIsUserDriveFileUpolad(true)
    const getTypes = (pathname: string) => {
      if (pathname === '/') return { resourceType: 'link', resultType: 'PDF' }
      const [resourceType, resultType] = pathname.split('/').slice(1, 3)
      return { resourceType, resultType: resultType.toUpperCase() }
    }
    const { resourceType, resultType } = getTypes(pathname)
    const fileURL = resourceUrl || `${API_BASE_URL}/${convertDataOptions[resourceType][resultType].type}/${fileName}`
    try {
      const fileBlob = await get(fileURL, { responseType: 'blob' })
      const formData = new FormData()
      const metadata = folderId
        ? {
            name: resourceName || fileName,
            parents: [folderId]
          }
        : {
            name: resourceName || fileName
          }
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      formData.append('file', fileBlob)
      const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
      const options = {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
      return await post(url, formData, options)
    } catch (error) {
      setIsUserDriveFileUpolad(false)
      console.log(error)
    } finally {
      setIsUserDriveFileUpolad(false)
    }
  }

  return { getGoogleDriveFolderList, userDriveFileUpolad }
}
