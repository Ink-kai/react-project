$.each(obj.Result.CMISContractAcceptanceAnnexAttachment, function(index, element){
    /*$('table[name="Group6"]').find('span[class="delrow"]').eq(index).hide();*/
    $('table[name="Group6"]').find('input[name="Group6_Apply_ExclecTypeName"]').eq(index).val('验收材料');

    $('table[name="Group6"]').find('input[name="Group6_Apply_Enclosure"]').eq(index).hide();
    $('table[name="Group6"]').find('label[name="attfile_Group6_Apply_Enclosure"]').eq(index)
        .append('<a ' + (fileType == 1 ? 'href="' + element.url + '"' : ' target="_blank" href="/fileView/Preview?url=' + element.PreviewUrl + '"') + '>' + element.AttachmentShowFileName + '</a>');
    $('table[name="Group6"]').find('input[name="Group6_Apply_AttachmentID"]').eq(index).val(element.AttachmentID);
    $('table[name="Group6"]').find('input[name="Group6_Apply_AttachmentObjectID"]').eq(index).val(element.AttachmentObjectID);
    $('table[name="Group6"]').find('input[name="Group6_Apply_AttachmentShowFileName"]').eq(index).val(element.AttachmentShowFileName);
    $('table[name="Group6"]').find('input[name="Group6_Apply_AttachmentObjectModule"]').eq(index).val('CMIS_ContractAcceptanceAnnex');

});