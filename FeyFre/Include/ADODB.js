/*******************************************************************************
 * Microsoft Data Access - ActiveX Data Objects - constants and helpers set
 * v1.1
 *
 * Based on ADO Import Type Library v2.81
 * Author: Panych Y.W. panych.y (bark) gmail.com
 * Forum thread: http://akelpad.sourceforge.net/forum/viewtopic.php?p=12315#12315
 * Download: http://staynormal.org.ua/akelpad/scripts/ADODB.js
 ******************************************************************************/
ADODB =
{
	CursorTypeEnum: {
		adOpenUnspecified:					-1,
		adOpenForwardOnly:					0,
		adOpenKeyset:						1,
		adOpenDynamic:						2,
		adOpenStatic:						3
	},
	CursorOptionEnum: {
		adHoldRecords:						256,
		adMovePrevious:						512,
		adAddNew:							16778240,
		adDelete:							16779264,
		adUpdate:							16809984,
		adBookmark:							8192,
		adApproxPosition:					16384,
		adUpdateBatch:						65536,
		adResync:							131072,
		adNotify:							262144,
		adFind:								524288,
		adSeek:								4194304,
		adIndex:							8388608
	},
	LockTypeEnum: {
		adLockUnspecified:					-1,
		adLockReadOnly:						1,
		adLockPessimistic:					2,
		adLockOptimistic:					3,
		adLockBatchOptimistic:				4
	},
	ExecuteOptionEnum: {
		adOptionUnspecified:				-1,
		adAsyncExecute:						16,
		adAsyncFetch:						32,
		adAsyncFetchNonBlocking:			64,
		adExecuteNoRecords:					128,
		adExecuteStream:					1024,
		adExecuteRecord:					2048
	},
	ConnectOptionEnum: {
		adConnectUnspecified:				-1,
		adAsyncConnect:						16
	},
	ObjectStateEnum: {
		adStateClosed:						0,
		adStateOpen:						1,
		adStateConnecting:					2,
		adStateExecuting:					4,
		adStateFetching:					8
	},
	CursorLocationEnum: {
		adUseNone:							1,
		adUseServer:						2,
		adUseClient:						3,
		adUseClientBatch:					3
	},
	DataTypeEnum: {
		adEmpty:							0,
		adTinyInt:							16,
		adSmallInt:							2,
		adInteger:							3,
		adBigInt:							20,
		adUnsignedTinyInt:					17,
		adUnsignedSmallInt:					18,
		adUnsignedInt:						19,
		adUnsignedBigInt:					21,
		adSingle:							4,
		adDouble:							5,
		adCurrency:							6,
		adDecimal:							14,
		adNumeric:							131,
		adBoolean:							11,
		adError:							10,
		adUserDefined:						132,
		adVariant:							12,
		adIDispatch:						9,
		adIUnknown:							13,
		adGUID:								72,
		adDate:								7,
		adDBDate:							133,
		adDBTime:							134,
		adDBTimeStamp:						135,
		adBSTR:								8,
		adChar:								129,
		adVarChar:							200,
		adLongVarChar:						201,
		adWChar:							130,
		adVarWChar:							202,
		adLongVarWChar:						203,
		adBinary:							128,
		adVarBinary:						204,
		adLongVarBinary:					205,
		adChapter:							136,
		adFileTime:							64,
		adPropVariant:						138,
		adVarNumeric:						139,
		adArray:							8192
	},
	FieldAttributeEnum: {
		adFldUnspecified:					-1,
		adFldMayDefer:						2,
		adFldUpdatable:						4,
		adFldUnknownUpdatable:				8,
		adFldFixed:							16,
		adFldIsNullable:					32,
		adFldMayBeNull:						64,
		adFldLong:							128,
		adFldRowID:							256,
		adFldRowVersion:					512,
		adFldCacheDeferred:					4096,
		adFldIsChapter:						8192,
		adFldNegativeScale:					16384,
		adFldKeyColumn:						32768,
		adFldIsRowURL:						65536,
		adFldIsDefaultStream:				131072,
		adFldIsCollection:					262144
	},
	EditModeEnum: {
		adEditNone:							0,
		adEditInProgress:					1,
		adEditAdd:							2,
		adEditDelete:						4
	},
	RecordStatusEnum: {
		adRecOK:							0,
		adRecNew:							1,
		adRecModified:						2,
		adRecDeleted:						4,
		adRecUnmodified:					8,
		adRecInvalid:						16,
		adRecMultipleChanges:				64,
		adRecPendingChanges:				128,
		adRecCanceled:						256,
		adRecCantRelease:					1024,
		adRecConcurrencyViolation:			2048,
		adRecIntegrityViolation:			4096,
		adRecMaxChangesExceeded:			8192,
		adRecObjectOpen:					16384,
		adRecOutOfMemory:					32768,
		adRecPermissionDenied:				65536,
		adRecSchemaViolation:				131072,
		adRecDBDeleted:						262144
	},
	GetRowsOptionEnum: {
		adGetRowsRest:						-1
	},
	PositionEnum: {
		adPosUnknown:						-1,
		adPosBOF:							-2,
		adPosEOF:							-3
	},
	PositionEnum_Param: { //! Fully equal PositionEnum(typedef-ed in typelib)
		adPosUnknown:						-1,
		adPosBOF:							-2,
		adPosEOF:							-3
	},
	BookmarkEnum: {
		adBookmarkCurrent:					0,
		adBookmarkFirst:					1,
		adBookmarkLast:						2
	},
	MarshalOptionsEnum: {
		adMarshalAll:						0,
		adMarshalModifiedOnly:				1
	},
	AffectEnum: {
		adAffectCurrent:					1,
		adAffectGroup:						2,
		adAffectAll:						3,
		adAffectAllChapters:				4
	},
	ResyncEnum: {
		adResyncUnderlyingValues:			1,
		adResyncAllValues:					2
	},
	CompareEnum: {
		adCompareLessThan:					0,
		adCompareEqual:						1,
		adCompareGreaterThan:				2,
		adCompareNotEqual:					3,
		adCompareNotComparable:				4
	},
	FilterGroupEnum: {
		adFilterNone:						0,
		adFilterPendingRecords:				1,
		adFilterAffectedRecords:			2,
		adFilterFetchedRecords:				3,
		adFilterPredicate:					4,
		adFilterConflictingRecords:			5
	},
	SearchDirectionEnum: {
		adSearchForward:					1,
		adSearchBackward:					-1
	},
	typedef SearchDirectionEnum SearchDirection;
	PersistFormatEnum: {
		adPersistADTG:						0,
		adPersistXML:						1
	},
	StringFormatEnum: {
		adClipString:						2
	},
	ConnectPromptEnum: {
		adPromptAlways:						1,
		adPromptComplete:					2,
		adPromptCompleteRequired:			3,
		adPromptNever:						4
	},
	ConnectModeEnum: {
		adModeUnknown:						0,
		adModeRead:							1,
		adModeWrite:						2,
		adModeReadWrite:					3,
		adModeShareDenyRead:				4,
		adModeShareDenyWrite:				8,
		adModeShareExclusive:				12,
		adModeShareDenyNone:				16,
		adModeRecursive:					4194304
	},
	RecordCreateOptionsEnum: {
		adCreateCollection:					8192,
		adCreateStructDoc:					-2147483648,
		adCreateNonCollection:				0,
		adOpenIfExists:						33554432,
		adCreateOverwrite:					67108864,
		adFailIfNotExists:					-1
	},
	RecordOpenOptionsEnum: {
		adOpenRecordUnspecified:			-1,
		adOpenSource:						8388608,
		adOpenOutput:						8388608,
		adOpenAsync:						4096,
		adDelayFetchStream:					16384,
		adDelayFetchFields:					32768,
		adOpenExecuteCommand:				65536
	},
	IsolationLevelEnum: {
		adXactUnspecified:					-1,
		adXactChaos:						16,
		adXactReadUncommitted:				256,
		adXactBrowse:						256,
		adXactCursorStability:				4096,
		adXactReadCommitted:				4096,
		adXactRepeatableRead:				65536,
		adXactSerializable:					1048576,
		adXactIsolated:						1048576
	},
	XactAttributeEnum: {
		adXactCommitRetaining:				131072,
		adXactAbortRetaining:				262144,
		adXactAsyncPhaseOne:				524288,
		adXactSyncPhaseOne:					1048576
	},
	PropertyAttributesEnum: {
		adPropNotSupported:					0,
		adPropRequired:						1,
		adPropOptional:						2,
		adPropRead:							512,
		adPropWrite:						1024
	},
	ErrorValueEnum: {
		adErrProviderFailed:				3000,
		adErrInvalidArgument:				3001,
		adErrOpeningFile:					3002,
		adErrReadFile:						3003,
		adErrWriteFile:						3004,
		adErrNoCurrentRecord:				3021,
		adErrIllegalOperation:				3219,
		adErrCantChangeProvider:			3220,
		adErrInTransaction:					3246,
		adErrFeatureNotAvailable:			3251,
		adErrItemNotFound:					3265,
		adErrObjectInCollection:			3367,
		adErrObjectNotSet:					3420,
		adErrDataConversion:				3421,
		adErrObjectClosed:					3704,
		adErrObjectOpen:					3705,
		adErrProviderNotFound:				3706,
		adErrBoundToCommand:				3707,
		adErrInvalidParamInfo:				3708,
		adErrInvalidConnection:				3709,
		adErrNotReentrant:					3710,
		adErrStillExecuting:				3711,
		adErrOperationCancelled:			3712,
		adErrStillConnecting:				3713,
		adErrInvalidTransaction:			3714,
		adErrNotExecuting:					3715,
		adErrUnsafeOperation:				3716,
		adwrnSecurityDialog:				3717,
		adwrnSecurityDialogHeader:			3718,
		adErrIntegrityViolation:			3719,
		adErrPermissionDenied:				3720,
		adErrDataOverflow:					3721,
		adErrSchemaViolation:				3722,
		adErrSignMismatch:					3723,
		adErrCantConvertvalue:				3724,
		adErrCantCreate:					3725,
		adErrColumnNotOnThisRow:			3726,
		adErrURLDoesNotExist:				3727,
		adErrTreePermissionDenied:			3728,
		adErrInvalidURL:					3729,
		adErrResourceLocked:				3730,
		adErrResourceExists:				3731,
		adErrCannotComplete:				3732,
		adErrVolumeNotFound:				3733,
		adErrOutOfSpace:					3734,
		adErrResourceOutOfScope:			3735,
		adErrUnavailable:					3736,
		adErrURLNamedRowDoesNotExist:		3737,
		adErrDelResOutOfScope:				3738,
		adErrPropInvalidColumn:				3739,
		adErrPropInvalidOption:				3740,
		adErrPropInvalidValue:				3741,
		adErrPropConflicting:				3742,
		adErrPropNotAllSettable:			3743,
		adErrPropNotSet:					3744,
		adErrPropNotSettable:				3745,
		adErrPropNotSupported:				3746,
		adErrCatalogNotSet:					3747,
		adErrCantChangeConnection:			3748,
		adErrFieldsUpdateFailed:			3749,
		adErrDenyNotSupported:				3750,
		adErrDenyTypeNotSupported:			3751,
		adErrProviderNotSpecified:			3753,
		adErrConnectionStringTooLong:		3754
	},
	ParameterAttributesEnum: {
		adParamSigned:						16,
		adParamNullable:					64,
		adParamLong:						128
	},
	ParameterDirectionEnum: {
		adParamUnknown:						0,
		adParamInput:						1,
		adParamOutput:						2,
		adParamInputOutput:					3,
		adParamReturnValue:					4
	},
	CommandTypeEnum: {
		adCmdUnspecified:					-1,
		adCmdUnknown:						8,
		adCmdText:							1,
		adCmdTable:							2,
		adCmdStoredProc:					4,
		adCmdFile:							256,
		adCmdTableDirect:					512
	},
	EventStatusEnum: {
		adStatusOK:							1,
		adStatusErrorsOccurred:				2,
		adStatusCantDeny:					3,
		adStatusCancel:						4,
		adStatusUnwantedEvent:				5
	},
	EventReasonEnum: {
		adRsnAddNew:						1,
		adRsnDelete:						2,
		adRsnUpdate:						3,
		adRsnUndoUpdate:					4,
		adRsnUndoAddNew:					5,
		adRsnUndoDelete:					6,
		adRsnRequery:						7,
		adRsnResynch:						8,
		adRsnClose:							9,
		adRsnMove:							10,
		adRsnFirstChange:					11,
		adRsnMoveFirst:						12,
		adRsnMoveNext:						13,
		adRsnMovePrevious:					14,
		adRsnMoveLast:						15
	},
	SchemaEnum: {
		adSchemaProviderSpecific:			-1,
		adSchemaAsserts:					0,
		adSchemaCatalogs:					1,
		adSchemaCharacterSets:				2,
		adSchemaCollations:					3,
		adSchemaColumns:					4,
		adSchemaCheckConstraints:			5,
		adSchemaConstraintColumnUsage:		6,
		adSchemaConstraintTableUsage:		7,
		adSchemaKeyColumnUsage:				8,
		adSchemaReferentialContraints:		9,
		adSchemaReferentialConstraints:		9,
		adSchemaTableConstraints:			10,
		adSchemaColumnsDomainUsage:			11,
		adSchemaIndexes:					12,
		adSchemaColumnPrivileges:			13,
		adSchemaTablePrivileges:			14,
		adSchemaUsagePrivileges:			15,
		adSchemaProcedures:					16,
		adSchemaSchemata:					17,
		adSchemaSQLLanguages:				18,
		adSchemaStatistics:					19,
		adSchemaTables:						20,
		adSchemaTranslations:				21,
		adSchemaProviderTypes:				22,
		adSchemaViews:						23,
		adSchemaViewColumnUsage:			24,
		adSchemaViewTableUsage:				25,
		adSchemaProcedureParameters:		26,
		adSchemaForeignKeys:				27,
		adSchemaPrimaryKeys:				28,
		adSchemaProcedureColumns:			29,
		adSchemaDBInfoKeywords:				30,
		adSchemaDBInfoLiterals:				31,
		adSchemaCubes:						32,
		adSchemaDimensions:					33,
		adSchemaHierarchies:				34,
		adSchemaLevels:						35,
		adSchemaMeasures:					36,
		adSchemaProperties:					37,
		adSchemaMembers:					38,
		adSchemaTrustees:					39,
		adSchemaFunctions:					40,
		adSchemaActions:					41,
		adSchemaCommands:					42,
		adSchemaSets:						43
	},
	FieldStatusEnum: {
		adFieldOK:							0,
		adFieldCantConvertValue:			2,
		adFieldIsNull:						3,
		adFieldTruncated:					4,
		adFieldSignMismatch:				5,
		adFieldDataOverflow:				6,
		adFieldCantCreate:					7,
		adFieldUnavailable:					8,
		adFieldPermissionDenied:			9,
		adFieldIntegrityViolation:			10,
		adFieldSchemaViolation:				11,
		adFieldBadStatus:					12,
		adFieldDefault:						13,
		adFieldIgnore:						15,
		adFieldDoesNotExist:				16,
		adFieldInvalidURL:					17,
		adFieldResourceLocked:				18,
		adFieldResourceExists:				19,
		adFieldCannotComplete:				20,
		adFieldVolumeNotFound:				21,
		adFieldOutOfSpace:					22,
		adFieldCannotDeleteSource:			23,
		adFieldReadOnly:					24,
		adFieldResourceOutOfScope:			25,
		adFieldAlreadyExists:				26,
		adFieldPendingInsert:				65536,
		adFieldPendingDelete:				131072,
		adFieldPendingChange:				262144,
		adFieldPendingUnknown:				524288,
		adFieldPendingUnknownDelete:		1048576
	},
	SeekEnum: {
		adSeekFirstEQ:						1,
		adSeekLastEQ:						2,
		adSeekAfterEQ:						4,
		adSeekAfter:						8,
		adSeekBeforeEQ:						16,
		adSeekBefore:						32
	},
	ADCPROP_UPDATECRITERIA_ENUM: {
		adCriteriaKey:						0,
		adCriteriaAllCols:					1,
		adCriteriaUpdCols:					2,
		adCriteriaTimeStamp:				3
	},
	ADCPROP_ASYNCTHREADPRIORITY_ENUM: {
		adPriorityLowest:					1,
		adPriorityBelowNormal:				2,
		adPriorityNormal:					3,
		adPriorityAboveNormal:				4,
		adPriorityHighest:					5
	},
	ADCPROP_AUTORECALC_ENUM: {
		adRecalcUpFront:					0,
		adRecalcAlways:						1
	},
	ADCPROP_UPDATERESYNC_ENUM: {
		adResyncNone:						0,
		adResyncAutoIncrement:				1,
		adResyncConflicts:					2,
		adResyncUpdates:					4,
		adResyncInserts:					8,
		adResyncAll:						15
	},
	MoveRecordOptionsEnum: {
		adMoveUnspecified:					-1,
		adMoveOverWrite:					1,
		adMoveDontUpdateLinks:				2,
		adMoveAllowEmulation:				4
	},
	CopyRecordOptionsEnum: {
		adCopyUnspecified:					-1,
		adCopyOverWrite:					1,
		adCopyAllowEmulation:				4,
		adCopyNonRecursive:					2
	},
	StreamTypeEnum: {
		adTypeBinary:						1,
		adTypeText:							2
	},
	LineSeparatorEnum: {
		adLF:								10,
		adCR:								13,
		adCRLF:								-1
	},
	StreamOpenOptionsEnum: {
		adOpenStreamUnspecified:			-1,
		adOpenStreamAsync:					1,
		adOpenStreamFromRecord:				4
	},
	StreamWriteEnum: {
		adWriteChar:						0,
		adWriteLine:						1,
		stWriteChar:						0,
		stWriteLine:						1
	},
	SaveOptionsEnum: {
		adSaveCreateNotExist:				1,
		adSaveCreateOverWrite:				2
	},
	FieldEnum: {
		adDefaultStream:					-1,
		adRecordURL:						-2
	},
	StreamReadEnum: {
		adReadAll:							-1,
		adReadLine:							-2
	},
	RecordTypeEnum: {
		adSimpleRecord:						0,
		adCollectionRecord:					1,
		adStructDoc:						2
	},
	Connection:			function(){return new ActiveXObject("ADODB.Connection");},
	Record:				function(){return new ActiveXObject("ADODB.Record");},
	Stream:				function(){return new ActiveXObject("ADODB.Stream");},
	Command:			function(){return new ActiveXObject("ADODB.Command");},
	Recordset:			function(){return new ActiveXObject("ADODB.Recordset");},
	Parameter:			function(){return new ActiveXObject("ADODB.Parameter");}
};
