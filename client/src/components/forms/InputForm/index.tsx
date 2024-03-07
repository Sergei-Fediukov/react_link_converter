import { FC, useCallback, useContext, useEffect, useRef } from 'react'

import cn from 'classnames'
import { FormApi } from 'final-form'
import { Form } from 'react-final-form'

import { PATHS, post, projectKeys } from 'src/api'
import { DownloadFileButton } from 'src/components/buttons/DownloadFileButton'
import { ImagePreviewButton } from 'src/components/buttons/ImagePreviewButton'
import { CustomInput } from 'src/components/CustomInput'
import { InfoBlock } from 'src/components/InfoBlock'
import { ConvertedDataContext } from 'src/context/convertedDataContext.ts/ConvertedDataContext'
import { SubmittingDisableContext } from 'src/context/submittingDisable/SubmittingDisableContext'
import { fileDownload } from 'src/helpers/fileDownload'
import { useValidationSchema } from 'src/hooks/useFormValidationSchema'
import { useRequestProcessor } from 'src/hooks/useRequest'
import { validationSchema } from 'src/yup.schemas/link'

import styles from './style.module.scss'

interface Props {
  title: string
}

interface ISubmitProps {
  url: string
  converType: string
}

export const InputForm: FC<Props> = ({ title }) => {
  const { isSubmitting, setIsSubmitting } = useContext(SubmittingDisableContext)
  const { convertedData, requestErrors, convertDataOptions, setConvertedData, setRequestErrors } = useContext(ConvertedDataContext)

  const formRef: React.MutableRefObject<FormApi> = useRef(null)

  const { useMutation } = useRequestProcessor()
  const { mutate: getConvertedData, isLoading } = useMutation(projectKeys.urlConverter, ({ url }: ISubmitProps) => post(PATHS.urlConverter, { url, convertType: title }))
  const { mutate: healhCheckRequest, isLoading: isHealthCheckLoading } = useMutation(projectKeys.urlHealthCheck, ({ url }: ISubmitProps) => post(PATHS.urlHealthCheck, { url, convertType: title }))

  useEffect(() => {
    setIsSubmitting(isLoading)
  }, [setIsSubmitting, isLoading, isHealthCheckLoading])

  useEffect(() => {
    // Set initial values
    setConvertedData(null)
    setRequestErrors([])
    if (formRef.current) {
      formRef.current.reset({ url: '' })
      formRef.current = null
    }
  }, [title, formRef, setConvertedData, setRequestErrors])

  const validate = useValidationSchema(validationSchema, { isArrayResult: true })

  const handleButtonSubmit = useCallback(
    (values: ISubmitProps) => {
      // Set initial values
      setConvertedData(null)
      setRequestErrors([])

      // Send health check request
      healhCheckRequest(values, {
        onSuccess: (data) => {
          if (!data) {
            setRequestErrors((errors: any) => [...errors, 'Url is invalid'])
          }
          // Convert only if endpoint is available
          if (data) {
            getConvertedData(values, {
              onSuccess: (data: any) => setConvertedData(data),
              onError: (e) => setRequestErrors((errors: any) => [...errors, e])
            })
          }
        },
        onError: (e) => setRequestErrors((errors: any) => [...errors, e])
      })
    },
    [getConvertedData, setConvertedData, healhCheckRequest, setRequestErrors]
  )

  const handleFileDownload = useCallback(
    async (resourceName?: string) => {
      await fileDownload(resourceName ? { ...convertedData, resourceName } : convertedData, convertDataOptions.link[title].type)
    },
    [convertedData, convertDataOptions, title]
  )

  return (
    <Form
      initialValues={{ url: '' }}
      render={({ handleSubmit, form, valid }) => {
        formRef.current = form
        return (
          <form key={title} className={styles.animationGradualAppearance} onSubmit={handleSubmit}>
            <div className={cn(styles.form__title, { [styles.common__hidden]: isSubmitting, [styles.common__active]: !isSubmitting })}>
              {`Convert ${title === 'AUDIO' ? 'YouTube-' : ''}link to ${title}`}
            </div>
            <CustomInput handleButtonSubmit={handleSubmit} isSubmitting={isSubmitting} requestErrors={Boolean(requestErrors.length)} valid={valid} />
            {convertedData && convertedData?.previewImage && (
              <ImagePreviewButton handleFileDownload={handleFileDownload} imageName={convertedData?.previewImage} resourceName={convertedData?.resourceName} />
            )}
            {convertedData && !convertedData?.previewImage && <DownloadFileButton handleFileDownload={handleFileDownload} />}
            {!convertedData && !isLoading && !isHealthCheckLoading && <InfoBlock title={title} />}
          </form>
        )
      }}
      validate={validate}
      onSubmit={handleButtonSubmit}
    />
  )
}
