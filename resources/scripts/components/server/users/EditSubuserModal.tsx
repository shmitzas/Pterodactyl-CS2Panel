import React, { useContext, useEffect, useRef } from 'react';
import { Subuser } from '@/state/server/subusers';
import { Form, Formik, FieldArray } from 'formik';
import { array, object, string } from 'yup';
import Field from '@/components/elements/Field';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import createOrUpdateSubuser from '@/api/server/users/createOrUpdateSubuser';
import { ServerContext } from '@/state/server';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import { usePermissions } from '@/plugins/usePermissions';
import { useDeepCompareMemo } from '@/plugins/useDeepCompareMemo';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import PermissionTitleBox from '@/components/server/users/PermissionTitleBox';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import asModal from '@/hoc/asModal';
import PermissionRow from '@/components/server/users/PermissionRow';
import ModalContext from '@/context/ModalContext';

type Props = {
    subuser?: Subuser;
};

interface Values {
    email: string;
    permissions: string[];
    fileRules: string[];
}

const EditSubuserModal = ({ subuser }: Props) => {
    const ref = useRef<HTMLHeadingElement>(null);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSubuser = ServerContext.useStoreActions((actions) => actions.subusers.appendSubuser);
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes
    );
    const { dismiss, setPropOverrides } = useContext(ModalContext);

    const isRootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const permissions = useStoreState((state) => state.permissions.data);
    // The currently logged in user's permissions. We're going to filter out any permissions
    // that they should not need.
    const loggedInPermissions = ServerContext.useStoreState((state) => state.server.permissions);
    const [canEditUser] = usePermissions(subuser ? ['user.update'] : ['user.create']);
    const canEditFileRules = isRootAdmin || loggedInPermissions[0] === '*';

    // The permissions that can be modified by this user.
    const editablePermissions = useDeepCompareMemo(() => {
        const cleaned = Object.keys(permissions).map((key) =>
            Object.keys(permissions[key].keys).map((pkey) => `${key}.${pkey}`)
        );

        const list: string[] = ([] as string[]).concat.apply([], Object.values(cleaned));

        if (isRootAdmin || (loggedInPermissions.length === 1 && loggedInPermissions[0] === '*')) {
            return list;
        }

        return list.filter((key) => loggedInPermissions.indexOf(key) >= 0);
    }, [isRootAdmin, permissions, loggedInPermissions]);

    const submit = (values: Values) => {
        setPropOverrides({ showSpinnerOverlay: true });
        clearFlashes('user:edit');

        createOrUpdateSubuser(
            uuid,
            { email: values.email, permissions: values.permissions, fileRules: values.fileRules },
            subuser
        )
            .then((subuser) => {
                appendSubuser(subuser);
                dismiss();
            })
            .catch((error) => {
                console.error(error);
                setPropOverrides(null);
                clearAndAddHttpError({ key: 'user:edit', error });

                if (ref.current) {
                    ref.current.scrollIntoView();
                }
            });
    };

    useEffect(
        () => () => {
            clearFlashes('user:edit');
        },
        []
    );

    return (
        <Formik
            onSubmit={submit}
            initialValues={
                {
                    email: subuser?.email || '',
                    permissions: subuser?.permissions || [],
                    fileRules: subuser?.fileRules || [],
                } as Values
            }
            validationSchema={object().shape({
                email: string()
                    .max(191, 'Email addresses must not exceed 191 characters.')
                    .email('A valid email address must be provided.')
                    .required('A valid email address must be provided.'),
                permissions: array().of(string()),
                fileRules: array().of(
                    string()
                        .matches(/^\/[^\0]*$/, 'Each path must start with /')
                        .max(255)
                ),
            })}
        >
            <Form>
                <div css={tw`flex justify-between`}>
                    <h2 css={tw`text-2xl`} ref={ref}>
                        {subuser
                            ? `${canEditUser ? 'Modify' : 'View'} permissions for ${subuser.email}`
                            : 'Create new subuser'}
                    </h2>
                    <div>
                        <Button type={'submit'} css={tw`w-full sm:w-auto`}>
                            {subuser ? 'Save' : 'Invite User'}
                        </Button>
                    </div>
                </div>
                <FlashMessageRender byKey={'user:edit'} css={tw`mt-4`} />
                {!isRootAdmin && loggedInPermissions[0] !== '*' && (
                    <div css={tw`mt-4 pl-4 py-2 border-l-4 border-accent-text`}>
                        <p css={tw`text-sm text-neutral-300`}>
                            Only permissions which your account is currently assigned may be selected when creating or
                            modifying other users.
                        </p>
                    </div>
                )}
                {!subuser && (
                    <div css={tw`mt-6`}>
                        <Field
                            name={'email'}
                            label={'User Email'}
                            description={
                                'Enter the email address of the user you wish to invite as a subuser for this server.'
                            }
                        />
                    </div>
                )}
                <div css={tw`my-6`}>
                    <TitledGreyBox title={<p css={tw`text-sm uppercase`}>Directory Restrictions</p>}>
                        <p css={tw`text-sm text-neutral-400 mb-4`}>
                            Restrict this user to specific directories in the panel file browser. Leave empty to allow
                            access to all directories. A restricted user can&apos;t use SFTP or upload files.
                        </p>
                        <FieldArray name={'fileRules'}>
                            {({ push, remove, form }) => (
                                <div>
                                    {(form.values.fileRules as string[]).map((rule, index) => (
                                        <div key={index} css={tw`flex items-center mb-2`}>
                                            <input
                                                css={tw`flex-1 bg-paper-3 border border-rule rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent-text`}
                                                type={'text'}
                                                placeholder={'/plugins'}
                                                value={rule}
                                                disabled={!canEditFileRules}
                                                onChange={(e) =>
                                                    form.setFieldValue(`fileRules.${index}`, e.target.value)
                                                }
                                            />
                                            {canEditFileRules && (
                                                <button
                                                    type={'button'}
                                                    css={tw`ml-2 text-bad hover:text-ink text-sm px-2`}
                                                    onClick={() => remove(index)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {canEditFileRules && (
                                        <button
                                            type={'button'}
                                            css={tw`mt-2 text-accent-text hover:text-ink text-sm`}
                                            onClick={() => push('/')}
                                        >
                                            + Add allowed directory
                                        </button>
                                    )}
                                </div>
                            )}
                        </FieldArray>
                    </TitledGreyBox>
                </div>
                <div css={tw`my-6`}>
                    {Object.keys(permissions)
                        .filter((key) => key !== 'websocket')
                        .map((key, index) => (
                            <PermissionTitleBox
                                key={`permission_${key}`}
                                title={key}
                                isEditable={canEditUser}
                                permissions={Object.keys(permissions[key].keys).map((pkey) => `${key}.${pkey}`)}
                                css={index > 0 ? tw`mt-4` : undefined}
                            >
                                <p css={tw`text-sm text-neutral-400 mb-4`}>{permissions[key].description}</p>
                                {Object.keys(permissions[key].keys).map((pkey) => (
                                    <PermissionRow
                                        key={`permission_${key}.${pkey}`}
                                        permission={`${key}.${pkey}`}
                                        disabled={!canEditUser || editablePermissions.indexOf(`${key}.${pkey}`) < 0}
                                    />
                                ))}
                            </PermissionTitleBox>
                        ))}
                </div>
                <Can action={subuser ? 'user.update' : 'user.create'}>
                    <div css={tw`pb-6 flex justify-end`}>
                        <Button type={'submit'} css={tw`w-full sm:w-auto`}>
                            {subuser ? 'Save' : 'Invite User'}
                        </Button>
                    </div>
                </Can>
            </Form>
        </Formik>
    );
};

export default asModal<Props>({
    top: false,
})(EditSubuserModal);
